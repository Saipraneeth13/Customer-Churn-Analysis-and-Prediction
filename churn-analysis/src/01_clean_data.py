"""Step 1: Clean the raw Telco churn data and save a processed CSV."""
from pathlib import Path
import pandas as pd

RAW = Path("data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv")
OUT = Path("data/processed/churn_clean.csv")


def tenure_group(months: int) -> str:
    if months <= 12:
        return "0-12 months"
    if months <= 24:
        return "13-24 months"
    if months <= 48:
        return "25-48 months"
    return "49+ months"


def main() -> None:
    df = pd.read_csv(RAW)
    print(f"Raw shape: {df.shape}")

    # TotalCharges has blank strings for brand-new customers (tenure = 0)
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    print(f"Missing TotalCharges: {df['TotalCharges'].isna().sum()}")
    df = df.dropna(subset=["TotalCharges"])

    df = df.drop_duplicates(subset="customerID")

    # Target: Yes/No -> 1/0
    df["Churn"] = df["Churn"].map({"Yes": 1, "No": 0})

    # Tidy up repeated categories
    df = df.replace({"No internet service": "No", "No phone service": "No"})

    # Helpful feature for analysis and the dashboard
    df["tenure_group"] = df["tenure"].apply(tenure_group)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT, index=False)
    print(f"Clean shape: {df.shape}")
    print(f"Overall churn rate: {df['Churn'].mean():.1%}")
    print(f"Saved to {OUT}")


if __name__ == "__main__":
    main()
