# Customer Churn Analysis and Prediction


## Live Dashboard

Explore the interactive RETAINIQ Customer Churn Analysis dashboard:

[**Launch RETAINIQ Dashboard**]([PASTE_YOUR_STREAMLIT_URL_HERE](https://customer-churn-analysis-and-prediction-raqqjw9alfpe4ryrldg2kp.streamlit.app/)

Built with Streamlit, Python, and machine learning to analyze customer churn, identify high-risk customers, and explore churn drivers.

**Identify customers likely to leave, understand why they churn, and recommend data-driven retention strategies.**

[![Python](https://img.shields.io/badge/Python-3.x-blue)](https://www.python.org/)
[![SQL](https://img.shields.io/badge/SQL-PostgreSQL-336791)](https://www.postgresql.org/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--learn-orange)](https://scikit-learn.org/)
[![Dashboard](https://img.shields.io/badge/Dashboard-Power%20BI-yellow)](https://powerbi.microsoft.com/)

## Overview

Customer churn is a major challenge for telecom businesses, as acquiring new customers can be more expensive than retaining existing ones. This project analyzes customer data to identify churn patterns, predict customer churn risk using machine learning, and recommend targeted retention strategies.

Using the IBM Telco Customer Churn dataset, the project combines Python, PostgreSQL, machine learning, and Power BI to turn customer data into actionable business insights.

## Business Objectives

- Identify customer segments with the highest churn rates.
- Analyze the relationship between churn and contract type, tenure, payment method, and monthly charges.
- Build machine learning models to predict customer churn.
- Identify the key factors associated with customer attrition.
- Develop a Power BI dashboard to monitor churn trends and prioritize high-risk customers.
- Recommend targeted retention strategies to reduce customer attrition.

## Key Results

| Metric | Result |
|---|---:|
| Customer records analyzed | 7,000+ |
| Month-to-month contract churn rate | 43% |
| Two-year contract churn rate | 3% |
| Reported monthly revenue lost to churn | 30% |
| Best reported ROC-AUC | 0.84 |
| Reported recall | 78% |

*These figures reflect the reported project results. The revenue-loss definition, evaluation split, and model-specific metrics should be documented alongside the final analysis.*

## Technology Stack

| Technology | Purpose |
|---|---|
| Python | Data cleaning, exploratory analysis, and machine learning |
| Pandas & NumPy | Data manipulation and preprocessing |
| Scikit-learn | Model training, evaluation, and churn prediction |
| Matplotlib | Data visualization |
| PostgreSQL | Data storage and SQL-based business analysis |
| Power BI | Interactive dashboard and churn-risk reporting |
| Git & GitHub | Version control and project documentation |

## Dataset

**Source:** IBM Telco Customer Churn dataset

The dataset contains 7,043 telecom customer records and 21 columns, covering customer demographics, services, account information, billing, tenure, and churn status.

Key attributes include:

- `customerID` — Unique customer identifier
- `tenure` — Number of months the customer has stayed
- `Contract` — Month-to-month, one-year, or two-year contract
- `MonthlyCharges` — Customer's monthly billing amount
- `TotalCharges` — Total charges accumulated
- `PaymentMethod` — Customer's payment method
- `InternetService` — Type of internet service
- `Churn` — Whether the customer has left the service

### Download the dataset

1. Download the IBM Telco Customer Churn dataset from [Kaggle](https://www.kaggle.com/datasets/blastchar/telco-customer-churn).
2. Place the CSV file in `data/raw/`.
3. Keep the raw dataset out of version control to avoid committing unnecessary data files.

## Project Structure

```text
churn-analysis/
├── data/
│   ├── raw/                         # Original dataset (not committed)
│   └── processed/                   # Cleaned dataset
├── sql/
│   └── churn_analysis.sql           # SQL setup and analysis queries
├── src/
│   ├── 01_clean_data.py             # Data cleaning and feature creation
│   ├── 02_eda.py                    # Exploratory analysis and charts
│   └── 03_train_model.py            # Model training and prediction export
├── outputs/
│   ├── charts/                      # Generated visualizations
│   ├── metrics/                     # Model evaluation results
│   └── churn_predictions_for_powerbi.csv
├── powerbi/
│   ├── churn_dashboard.pbix         # Power BI report
│   └── screenshots/                 # Dashboard screenshots
├── requirements.txt
├── .gitignore
└── README.md
```

## Methodology

### 1. Data Cleaning and Preprocessing

The raw dataset was cleaned and prepared for analysis.

- Converted `TotalCharges` to a numeric data type.
- Handled blank `TotalCharges` values associated with customers with zero tenure.
- Encoded the churn target into binary values: `1` for churn and `0` for retention.
- Standardized service-related categories such as `No internet service` and `No phone service`.
- Created tenure groups and prepared relevant features for exploratory analysis and modelling.

### 2. SQL Analysis and Exploratory Data Analysis

PostgreSQL and Python were used to investigate customer churn patterns.

The analysis focused on:

- Churn rates by contract type.
- Churn across customer tenure groups.
- Churn by payment method and internet service.
- Relationships between monthly charges and customer attrition.
- Customer counts and estimated revenue exposure associated with churn.

These analyses helped identify customer segments that may benefit from targeted retention efforts.

### 3. Machine Learning Models

Two classification algorithms were developed and compared:

**Logistic Regression**
- Provides an interpretable baseline for churn prediction.
- Helps analyze how customer features relate to churn likelihood.

**Random Forest**
- Captures nonlinear relationships and interactions between customer features.
- Provides feature-importance estimates for understanding predictive signals.

The modelling workflow used a stratified train-test split to preserve the class distribution. Class weighting was applied to address the imbalance between churned and retained customers.

### 4. Model Evaluation

Because churn represents approximately 27% of the dataset, accuracy alone is insufficient to assess model performance.

The evaluation considered:

- **ROC-AUC:** Ability to distinguish between churned and retained customers.
- **Precision:** Proportion of predicted churners who actually churned.
- **Recall:** Proportion of actual churners correctly identified.
- **F1-score:** Balance between precision and recall.

The reported model performance reached a ROC-AUC of 0.84 and recall of 78%.

Higher recall can help identify more customers at risk, while precision is important for controlling the cost of retention campaigns. The final operating threshold should reflect the business's retention budget and the relative cost of missed churners and unnecessary offers.

### 5. Churn Risk Classification

Predicted churn probabilities were exported for use in Power BI.

Customers were grouped into three risk categories:

- **Low Risk:** Lower predicted probability of churn.
- **Medium Risk:** Moderate predicted probability of churn.
- **High Risk:** Higher predicted probability of churn.

Risk bands are intended to help prioritize outreach. Their probability thresholds should be defined and documented in the modelling code rather than selected arbitrarily.

## Key Business Insights

### Contract Type Is Strongly Associated With Churn

Month-to-month customers had a reported churn rate of 43%, compared with 3% among customers on two-year contracts.

**Business implication:** Consider offering suitable month-to-month customers incentives to move to longer-term plans, while accounting for customer preferences and offer costs.

### Early-Tenure Customers Need Attention

Customers in the early stages of their relationship may require additional onboarding and engagement.

**Business implication:** Examine churn during the first 12 months and consider targeted onboarding, service education, and proactive support for at-risk customers.

### Churn Risk Can Support Proactive Retention

Predictive probabilities can help teams identify customers who may need intervention before they leave.

**Business implication:** Use churn-risk scores to prioritize customer outreach, monitor retention outcomes, and improve campaign targeting.

*The specific tenure patterns and leading predictive features should be confirmed from the generated analysis outputs before being presented as final findings.*

## Power BI Dashboard

The dashboard is designed to help business stakeholders understand churn patterns and prioritize customer retention.

### Recommended Dashboard Components

**KPI Cards**
- Total customers
- Overall churn rate
- Monthly revenue at risk

**Customer Segmentation**
- Churn rate by contract type
- Churn rate by tenure group
- Churn rate by payment method
- Churn rate by internet service

**Risk Analysis**
- Customer distribution by low, medium, and high risk
- High-risk customer table sorted by predicted churn probability
- Filters for contract type, tenure, and customer risk

### Dashboard Preview

Add dashboard screenshots here after generating the Power BI report.

```markdown
![Churn Overview](powerbi/screenshots/churn_overview.png)
![Customer Risk Analysis](powerbi/screenshots/customer_risk_analysis.png)
```

## Retention Recommendation

Prioritize month-to-month customers with elevated predicted churn risk, particularly those in their first year of service.

A targeted retention strategy could include:

1. Identifying high-risk customers using the predictive model.
2. Segmenting them by contract type, tenure, and monthly charges.
3. Offering relevant incentives, such as a discounted longer-term contract where appropriate.
4. Providing proactive support to customers experiencing service or billing issues.
5. Measuring campaign effectiveness through retention rate, incremental revenue retained, and cost per retained customer.

Retention campaigns should be evaluated using controlled experiments where practical. This helps determine whether an offer actually reduces churn rather than simply targeting customers who were already likely to stay.

## How to Run the Project

### Prerequisites

- Python 3.x
- PostgreSQL
- Power BI Desktop (for dashboard development)

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd churn-analysis
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Add the Dataset

Place the downloaded CSV in `data/raw/`, using the filename expected by the preprocessing script.

### 4. Run the Analysis

```bash
python src/01_clean_data.py
python src/02_eda.py
python src/03_train_model.py
```

The scripts should generate the cleaned dataset, exploratory visualizations, evaluation results, and churn predictions.

### 5. Run the SQL Analysis

Create a PostgreSQL database and execute the SQL script:

```bash
psql -d churn_analysis -f sql/churn_analysis.sql
```

Update the database name, connection settings, and CSV path as required by your local environment. The `\copy` command in the SQL file must point to the correct dataset location.

### 6. Open the Power BI Dashboard

1. Open the Power BI report in `powerbi/`.
2. Load `outputs/churn_predictions_for_powerbi.csv`.
3. Configure the visualizations, filters, and KPI cards.
4. Save the report and export screenshots for this README.

## Limitations

- The dataset represents a single snapshot and does not provide a complete time-series history of customer behavior.
- Predictive associations do not establish that a particular feature causes churn.
- Model performance may change when applied to a different customer population or a later period.
- Revenue at risk is an estimate and should not automatically be interpreted as revenue that would certainly be lost.
- Retention offers have costs that are not captured by the dataset.
- Churn probabilities are useful for ranking customers but require calibration and threshold validation before operational use.

## Future Improvements

- Evaluate models using cross-validation and compare their stability across folds.
- Tune classification thresholds based on retention campaign costs and business objectives.
- Add probability calibration and explainability using tools such as SHAP.
- Track retention campaign outcomes and evaluate incremental impact through controlled experiments.
- Incorporate longitudinal customer data to support time-based churn prediction.
- Deploy the model as an API and integrate updated predictions into a business dashboard.

## Conclusion

This project demonstrates an end-to-end customer churn analytics workflow, combining SQL-based business analysis, Python-driven machine learning, and Power BI visualization.

By identifying high-churn customer segments and prioritizing customers with elevated predicted risk, the workflow provides a foundation for more targeted retention strategies and data-driven decision-making.

---

**Author:** Hemanth Chakravarthy Kancharla

**Tools:** Python, Pandas, Scikit-learn, PostgreSQL, Matplotlib, Power BI

**Project Type:** Data Analytics | Machine Learning | Business Intelligence
