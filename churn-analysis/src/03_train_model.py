"""Step 3: Train logistic regression and random forest, compare, and export for Power BI."""
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (classification_report, roc_auc_score,
                             precision_score, recall_score, f1_score, RocCurveDisplay)
from sklearn.model_selection import train_test_split, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

DATA = Path("data/processed/churn_clean.csv")
OUT = Path("outputs")
RANDOM_STATE = 42


def build_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
    num_cols = X.select_dtypes(include="number").columns.tolist()
    cat_cols = X.select_dtypes(exclude="number").columns.tolist()
    return ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
    ])


def main() -> None:
    OUT.mkdir(exist_ok=True)
    df = pd.read_csv(DATA)

    # tenure_group is derived from tenure, so drop it for modelling
    X = df.drop(columns=["customerID", "Churn", "tenure_group"])
    y = df["Churn"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE)

    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, class_weight="balanced"),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, max_depth=8, class_weight="balanced",
            random_state=RANDOM_STATE, n_jobs=-1),
    }

    pipes, results = {}, []
    fig, ax = plt.subplots(figsize=(6, 5))
    for name, model in models.items():
        pipe = Pipeline([("prep", build_preprocessor(X)), ("model", model)])
        pipe.fit(X_train, y_train)
        proba = pipe.predict_proba(X_test)[:, 1]
        pred = pipe.predict(X_test)
        results.append({
            "model": name,
            "roc_auc": roc_auc_score(y_test, proba),
            "precision": precision_score(y_test, pred),
            "recall": recall_score(y_test, pred),
            "f1": f1_score(y_test, pred),
        })
        print(f"\n=== {name} ===")
        print(classification_report(y_test, pred, target_names=["Stayed", "Churned"]))
        RocCurveDisplay.from_predictions(y_test, proba, name=name, ax=ax)
        pipes[name] = pipe

    ax.plot([0, 1], [0, 1], "k--", alpha=0.4)
    ax.set_title("ROC curves")
    plt.tight_layout()
    plt.savefig(OUT / "roc_curves.png", dpi=150)

    metrics = pd.DataFrame(results).round(3)
    metrics.to_csv(OUT / "model_metrics.csv", index=False)
    print("\nModel comparison:\n", metrics.to_string(index=False))

    # ---- Churn drivers ----
    lr = pipes["Logistic Regression"]
    names = lr.named_steps["prep"].get_feature_names_out()
    coefs = pd.Series(lr.named_steps["model"].coef_[0], index=names).sort_values()
    top = pd.concat([coefs.head(8), coefs.tail(8)])
    plt.figure(figsize=(8, 6))
    top.plot(kind="barh", color="#0E5484")
    plt.title("Logistic regression coefficients (+ raises churn risk, - lowers it)")
    plt.tight_layout()
    plt.savefig(OUT / "lr_coefficients.png", dpi=150)

    rf = pipes["Random Forest"]
    imp = pd.Series(rf.named_steps["model"].feature_importances_,
                    index=rf.named_steps["prep"].get_feature_names_out()).sort_values(ascending=False)
    imp.to_csv(OUT / "rf_feature_importance.csv", header=["importance"])
    plt.figure(figsize=(8, 6))
    imp.head(10).sort_values().plot(kind="barh", color="#0E5484")
    plt.title("Top 10 churn drivers (Random Forest)")
    plt.tight_layout()
    plt.savefig(OUT / "rf_feature_importance.png", dpi=150)
    print("\nTop 10 drivers (Random Forest):\n", imp.head(10).round(3))

    # ---- Export for Power BI: out-of-fold churn probability for every customer ----
    best = metrics.sort_values("roc_auc", ascending=False).iloc[0]["model"]
    print(f"\nBest model by ROC-AUC: {best}")
    final = Pipeline([("prep", build_preprocessor(X)), ("model", models[best])])
    oof = cross_val_predict(final, X, y, cv=5, method="predict_proba")[:, 1]

    export = df.copy()
    export["churn_probability"] = oof.round(4)
    export["risk_band"] = pd.cut(oof, bins=[0, 0.4, 0.7, 1.0],
                                 labels=["Low", "Medium", "High"], include_lowest=True)
    export.to_csv(OUT / "churn_predictions_for_powerbi.csv", index=False)
    print("Saved outputs/churn_predictions_for_powerbi.csv")


if __name__ == "__main__":
    main()
