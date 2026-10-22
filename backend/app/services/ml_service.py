from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    confusion_matrix, roc_curve, roc_auc_score,
    precision_score, recall_score, f1_score, accuracy_score
)
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline

from app.schemas import (
    ModelMetrics, ConfusionMatrixData, ROCCurvePoint, FeatureImportanceItem
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
REPO_DIR = BASE_DIR.parent
OUTPUTS_DIR = REPO_DIR / "churn-analysis" / "outputs"
DATA_PATH = REPO_DIR / "churn-analysis" / "data" / "processed" / "churn_clean.csv"

class MLService:
    def __init__(self):
        self._models_cache: Optional[Dict[str, ModelMetrics]] = None
        self._rf_importance_cache: Optional[List[FeatureImportanceItem]] = None
        self._lr_coefficients_cache: Optional[List[FeatureImportanceItem]] = None

    def _train_and_evaluate(self):
        if not DATA_PATH.exists():
            raise FileNotFoundError(f"Clean data not found at {DATA_PATH}")

        df = pd.read_csv(DATA_PATH)
        X = df.drop(columns=["customerID", "Churn", "tenure_group"])
        y = df["Churn"]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, stratify=y, random_state=42
        )

        num_cols = X.select_dtypes(include="number").columns.tolist()
        cat_cols = X.select_dtypes(exclude="number").columns.tolist()
        preprocessor = ColumnTransformer([
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ])

        models = {
            "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42),
            "Random Forest": RandomForestClassifier(
                n_estimators=300, max_depth=8, class_weight="balanced",
                random_state=42, n_jobs=-1
            ),
        }

        results = {}
        pipelines = {}

        for name, clf in models.items():
            pipe = Pipeline([("prep", preprocessor), ("model", clf)])
            pipe.fit(X_train, y_train)
            pipelines[name] = pipe

            proba = pipe.predict_proba(X_test)[:, 1]
            pred = pipe.predict(X_test)

            tn, fp, fn, tp = confusion_matrix(y_test, pred).ravel()
            total_eval = len(y_test)

            fpr, tpr, thresholds = roc_curve(y_test, proba)
            # Sample ~25 points for smooth chart rendering
            idx_step = max(1, len(fpr) // 25)
            sample_indices = list(range(0, len(fpr), idx_step))
            if (len(fpr) - 1) not in sample_indices:
                sample_indices.append(len(fpr) - 1)

            roc_points = [
                ROCCurvePoint(
                    fpr=round(float(fpr[i]), 4),
                    tpr=round(float(tpr[i]), 4),
                    threshold=round(float(thresholds[i]), 4) if thresholds[i] < 10 else 1.0
                )
                for i in sample_indices
            ]

            results[name] = ModelMetrics(
                model_name=name,
                roc_auc=round(float(roc_auc_score(y_test, proba)), 4),
                precision=round(float(precision_score(y_test, pred)), 4),
                recall=round(float(recall_score(y_test, pred)), 4),
                f1_score=round(float(f1_score(y_test, pred)), 4),
                accuracy=round(float(accuracy_score(y_test, pred)), 4),
                confusion_matrix=ConfusionMatrixData(
                    tn=int(tn),
                    fp=int(fp),
                    fn=int(fn),
                    tp=int(tp),
                    total=int(total_eval)
                ),
                roc_curve=roc_points
            )

        self._models_cache = results

        # Random Forest feature importance
        rf_model = pipelines["Random Forest"]
        prep = rf_model.named_steps["prep"]
        feature_names = prep.get_feature_names_out()
        rf_importances = rf_model.named_steps["model"].feature_importances_

        rf_items = []
        for feat_name, imp in zip(feature_names, rf_importances):
            clean_name, category = self._clean_feature_name(feat_name)
            rf_items.append(FeatureImportanceItem(
                feature=feat_name,
                label=clean_name,
                importance=round(float(imp), 4),
                category=category,
                direction=None,
                raw_coefficient=None
            ))
        rf_items.sort(key=lambda x: x.importance, reverse=True)
        self._rf_importance_cache = rf_items

        # Logistic Regression coefficients
        lr_model = pipelines["Logistic Regression"]
        lr_coefs = lr_model.named_steps["model"].coef_[0]
        lr_items = []
        for feat_name, coef in zip(feature_names, lr_coefs):
            clean_name, category = self._clean_feature_name(feat_name)
            direction = "increases_churn" if coef > 0 else "reduces_churn"
            lr_items.append(FeatureImportanceItem(
                feature=feat_name,
                label=clean_name,
                importance=round(abs(float(coef)), 4),
                category=category,
                direction=direction,
                raw_coefficient=round(float(coef), 4)
            ))
        lr_items.sort(key=lambda x: x.importance, reverse=True)
        self._lr_coefficients_cache = lr_items

    def _clean_feature_name(self, raw_name: str) -> (str, str):
        # Format "cat__Contract_Month-to-month" -> ("Contract: Month-to-month", "Contract")
        clean = raw_name.replace("cat__", "").replace("num__", "").replace("_", ": ")
        category = "Account"
        if "Contract" in raw_name:
            category = "Contract"
        elif "tenure" in raw_name or "MonthlyCharges" in raw_name or "TotalCharges" in raw_name:
            category = "Tenure & Billing"
        elif "InternetService" in raw_name:
            category = "Internet Service"
        elif "PaymentMethod" in raw_name:
            category = "Payment Method"
        elif any(term in raw_name for term in ["Security", "Backup", "Protection", "Support"]):
            category = "Add-On Services"
        elif "Streaming" in raw_name:
            category = "Entertainment"
        return clean, category

    def get_model_metrics(self) -> Dict[str, ModelMetrics]:
        if self._models_cache is None:
            self._train_and_evaluate()
        return self._models_cache

    def get_feature_importance(self, model_type: str = "rf") -> List[FeatureImportanceItem]:
        if self._rf_importance_cache is None:
            self._train_and_evaluate()
        if model_type.lower() == "lr":
            return self._lr_coefficients_cache
        return self._rf_importance_cache

ml_service = MLService()
