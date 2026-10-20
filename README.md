# Customer Churn Analysis and Prediction

Which telecom customers are likely to leave, why, and what should the business do about it?

**Tools:** Python (Pandas, Scikit-learn, Matplotlib), SQL (PostgreSQL), Power BI

## Business problem
Acquiring a new customer costs far more than keeping an existing one. This project analyzes
~7,000 telecom customers to (1) find which segments churn the most, (2) predict which customers
are at risk, and (3) recommend a targeted retention action.

## Dataset
IBM **Telco Customer Churn** dataset (7,043 customers, 21 columns). See `data/README.md` for download steps.

## Project structure
```
churn-analysis/
├── data/            raw and processed data (raw CSV is git-ignored)
├── sql/             churn_analysis.sql  - table setup, clean view, segment queries
├── src/
│   ├── 01_clean_data.py     cleaning + feature creation
│   ├── 02_eda.py            churn by segment charts
│   └── 03_train_model.py    logistic regression vs random forest + Power BI export
├── outputs/         charts, metrics, predictions
├── powerbi/         dashboard file and screenshots
└── requirements.txt
```

## How to run
```bash
pip install -r requirements.txt
# put the dataset in data/raw/ first
python src/01_clean_data.py
python src/02_eda.py
python src/03_train_model.py
```
SQL: create a PostgreSQL database, then run `sql/churn_analysis.sql` in psql
(the `\copy` line loads the CSV).

## Approach
1. **Cleaning:** converted `TotalCharges` to numeric (blank values for brand-new customers removed),
   encoded the target as 0/1, merged "No internet service" / "No phone service" into "No".
2. **SQL + EDA:** churn rate by contract, tenure group, payment method, internet service; revenue lost to churn.
3. **Modelling:** logistic regression and random forest, stratified 80/20 split, `class_weight="balanced"`
   because only ~27% of customers churn.
4. **Evaluation:** ROC-AUC, precision, recall, F1. Accuracy alone is misleading with imbalanced classes.
5. **Dashboard:** Power BI report built from `outputs/churn_predictions_for_powerbi.csv`.

## Results (fill in after running)
| Model | ROC-AUC | Precision | Recall | F1 |
|---|---|---|---|---|
| Logistic Regression | | | | |
| Random Forest | | | | |

**Key findings**
- Overall churn rate: _X%_
- Month-to-month contracts churn at _X%_ vs _X%_ for two-year contracts
- Customers in their first 12 months churn at _X%_
- Top churn drivers: _1, 2, 3_

## Recommendation
_Example, adjust to your findings:_ target month-to-month customers in their first year with a
retention offer (e.g. discount for moving to an annual contract), since this segment has the
highest churn and a large share of monthly revenue.

## Power BI dashboard
Load `outputs/churn_predictions_for_powerbi.csv` and build:
- KPI cards: total customers, churn rate, monthly revenue at risk
- Churn rate by Contract, Tenure group, Payment method (bar charts)
- Customers by risk band (Low / Medium / High) with a slicer
- Table of High-risk customers sorted by `churn_probability`

Add screenshots to `powerbi/` and embed them here.

## Limitations
Single snapshot dataset, no time dimension, and no cost data for retention offers,
so recommendations are directional.
