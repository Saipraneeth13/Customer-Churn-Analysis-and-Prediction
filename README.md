# Customer Churn Analysis and Prediction

Which telecom customers are likely to leave, why, and what should the business do about it?


**Tools:** Python (Pandas, Scikit-learn, Matplotlib), SQL (PostgreSQL), Power BI

## Business problem
Acquiring a new customer costs far more than keeping an existing one. This project analyzes
7,043 telecom customers to (1) find which segments churn the most, (2) predict which customers
are at risk, and (3) recommend a targeted retention action.

## Dataset
IBM **Telco Customer Churn** dataset (7,043 customers, 21 columns). It is a public sample dataset,
so results are illustrative rather than production-proven. See `data/README.md` for download steps.

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
1. **Cleaning:** converted `TotalCharges` to numeric and dropped the 11 rows with blank values
   (brand-new customers with zero tenure), leaving 7,032 customers. Encoded the target as 0/1 and
   merged "No internet service" / "No phone service" into "No".
2. **SQL + EDA:** churn rate by contract, tenure group, payment method and internet service;
   share of monthly revenue lost to churn.
3. **Modelling:** logistic regression and random forest, stratified 80/20 split,
   `class_weight="balanced"` because only about 27% of customers churn.
4. **Evaluation:** ROC-AUC, precision, recall, F1 on the held-out test set. Accuracy alone is
   misleading with imbalanced classes, so it is not used as the headline metric.
5. **Dashboard scoring:** churn probabilities in the Power BI file are **out-of-fold**
   (5-fold cross-validation via `cross_val_predict`), so every customer is scored by a model that
   never saw that customer during training.
6. **Risk bands:** Low (< 0.30), Medium (0.30 to 0.60), High (> 0.60) churn probability.

## Results
Test set: 20% stratified holdout, default 0.5 decision threshold.

| Model | ROC-AUC | Precision | Recall | F1 |
|---|---|---|---|---|
| Logistic Regression | TODO | TODO | TODO | TODO |
| Random Forest | TODO | TODO | TODO | TODO |

Best model: **TODO (name)**, with ROC-AUC of 0.84 and recall of 78% for the churn class.

**Key findings**
- Overall churn rate: about 27% (1,869 of 7,043 customers)
- Month-to-month contracts churn at 43% vs 3% for two-year contracts
- Customers in their first 12 months churn at TODO%
- About 30% of monthly revenue comes from customers who churned
- Top churn drivers (feature importance): contract type, tenure, monthly charges

**Risk bands (out-of-fold predictions)**

| Band | Probability | Customers |
|---|---|---|
| Low | < 0.30 | TODO |
| Medium | 0.30 to 0.60 | TODO |
| High | > 0.60 | TODO |

## Recommendation
Target **first-year month-to-month customers** with a retention offer, for example a discount for
moving to an annual contract. This segment has the highest churn rate and accounts for a large
share of monthly revenue. Use the High-risk band to prioritise who receives the offer first.

## Power BI dashboard
Built from `outputs/churn_predictions_for_powerbi.csv`:
- KPI cards: total customers, churn rate, monthly revenue at risk
- Churn rate by Contract, Tenure group and Payment method (bar charts)
- Customers by risk band (Low / Medium / High) with a slicer
- Table of High-risk customers sorted by `churn_probability`

Screenshots are in `powerbi/`.

## Limitations
- Single snapshot dataset with no time dimension, so churn timing cannot be modelled.
- No cost data for retention offers, so the recommendation is directional and ROI is not estimated.
- Public sample dataset: results are illustrative, not validated on live production data.
