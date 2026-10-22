from pathlib import Path
from typing import Optional, Dict, Any, List
import pandas as pd
import numpy as np

# Locate files relative to repository structure
BASE_DIR = Path(__file__).resolve().parent.parent.parent
REPO_DIR = BASE_DIR.parent
PROCESSED_DATA_PATH = REPO_DIR / "churn-analysis" / "data" / "processed" / "churn_clean.csv"
PREDICTIONS_DATA_PATH = REPO_DIR / "churn-analysis" / "outputs" / "churn_predictions_for_powerbi.csv"

class DataService:
    def __init__(self):
        self._df: Optional[pd.DataFrame] = None
        self._last_loaded: Optional[str] = None
        self._file_mtime: Optional[float] = None
        self.load_data()

    def get_source_path(self) -> Path:
        if PREDICTIONS_DATA_PATH.exists():
            return PREDICTIONS_DATA_PATH
        if PROCESSED_DATA_PATH.exists():
            return PROCESSED_DATA_PATH
        raise FileNotFoundError(f"Neither predictions nor processed data found at {PREDICTIONS_DATA_PATH}")

    def load_data(self) -> pd.DataFrame:
        path = self.get_source_path()
        df = pd.read_csv(path)

        # Standardize column naming if needed
        required_cols = ["customerID", "Churn", "MonthlyCharges", "tenure", "Contract"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column in data: {col}")

        # Ensure Churn is integer 0 or 1
        df["Churn"] = df["Churn"].astype(int)

        # Ensure numeric fields
        df["MonthlyCharges"] = pd.to_numeric(df["MonthlyCharges"], errors="coerce").fillna(0.0)
        df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce").fillna(df["MonthlyCharges"] * df["tenure"])
        df["tenure"] = pd.to_numeric(df["tenure"], errors="coerce").fillna(0).astype(int)

        # Ensure churn probability exists
        if "churn_probability" not in df.columns:
            # If not yet present, default to empirical segment rate or 0.266
            df["churn_probability"] = 0.266
        else:
            df["churn_probability"] = pd.to_numeric(df["churn_probability"], errors="coerce").fillna(0.266)

        # Standardize risk bands adhering strictly to 03_train_model.py specification:
        # Low: <= 0.40, Medium: 0.40 - 0.70, High: > 0.70
        # If risk_band is already present in the export, preserve it (it matches 03_train_model.py exactly)
        if "risk_band" not in df.columns or df["risk_band"].isnull().any():
            df["risk_band"] = pd.cut(
                df["churn_probability"],
                bins=[-0.001, 0.40, 0.70, 1.001],
                labels=["Low", "Medium", "High"]
            )
        else:
            # Ensure type is clean string
            df["risk_band"] = df["risk_band"].astype(str)

        # Ensure tenure_group exists
        if "tenure_group" not in df.columns:
            def tenure_grp(m: int) -> str:
                if m <= 12:
                    return "0-12 months"
                if m <= 24:
                    return "13-24 months"
                if m <= 48:
                    return "25-48 months"
                return "49+ months"
            df["tenure_group"] = df["tenure"].apply(tenure_grp)

        self._file_mtime = path.stat().st_mtime
        from datetime import datetime
        self._last_loaded = datetime.fromtimestamp(self._file_mtime).strftime("%Y-%m-%d %H:%M:%S")
        self._df = df
        return self._df

    @property
    def df(self) -> pd.DataFrame:
        if self._df is None:
            return self.load_data()
        return self._df

    @property
    def last_loaded(self) -> str:
        return self._last_loaded or "Unknown"

data_service = DataService()
