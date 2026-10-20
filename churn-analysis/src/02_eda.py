"""Step 2: Exploratory analysis - churn rate by key segments, saved as charts."""
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

DATA = Path("data/processed/churn_clean.csv")
OUT = Path("outputs")


def main() -> None:
    OUT.mkdir(exist_ok=True)
    df = pd.read_csv(DATA)

    cols = ["Contract", "tenure_group", "InternetService", "PaymentMethod"]
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    for ax, col in zip(axes.ravel(), cols):
        rate = df.groupby(col)["Churn"].mean().sort_values(ascending=False) * 100
        rate.plot(kind="bar", ax=ax, color="#0E5484")
        ax.set_title(f"Churn rate by {col}")
        ax.set_ylabel("Churn rate (%)")
        ax.tick_params(axis="x", rotation=30)
        print(f"\nChurn rate by {col}:\n{rate.round(1)}")
    plt.tight_layout()
    plt.savefig(OUT / "churn_by_segment.png", dpi=150)

    # Monthly charges: churned vs retained
    df.boxplot(column="MonthlyCharges", by="Churn", figsize=(6, 4))
    plt.title("Monthly charges by churn (0 = stayed, 1 = left)")
    plt.suptitle("")
    plt.savefig(OUT / "monthly_charges_by_churn.png", dpi=150)
    print("\nSaved charts to outputs/")


if __name__ == "__main__":
    main()
