# RETAINIQ: Premium Customer Retention Command Center

[**View Live Dashboard →**](https://customer-churn-analysis-and-prediction-raqqjw9alfpe4ryrldg2kp.streamlit.app/)

> **Tagline:** *Predict churn. Understand risk. Protect customer value.*

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.6-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/Tests-18%20Passed-10B981)](#testing)

**RETAINIQ** is a fintech-grade, high-contrast, interactive Customer Retention Command Center for telecom business leaders, customer success directors, and data analysts. Built on top of the authentic IBM Telco Customer Churn dataset (7,043 initial records, 7,032 verified clean records) and machine learning models, RETAINIQ transforms static reporting into a proactive, decision-support retention cockpit.

---

## 1. Executive Answers to Core Business Questions

| Core Question | RETAINIQ Finding | Metric / Evidence |
|---|---|---|
| **1. How serious is the churn problem?** | **Critical Exposure.** 26.6% overall churn rate; 1,869 customers lost. | **$139,131 / mo** in lost monthly recurring revenue (30.5% of total billing). |
| **2. Which customer segments churn the most?** | **Month-to-month contracts & first-year tenure.** | **42.7%** churn on Month-to-Month (vs 2.8% on 2-Year); **47.7%** in months 0–12. |
| **3. Which customers have the highest risk?** | **1,770 accounts** scored as High-Risk (>70% probability via model specification). | **$141,319 / mo** recurring revenue exposure represented by High-Risk cohort. |
| **4. What factors drive customer churn?** | Contract commitment, early tenure, electronic check friction, and fiber optic pricing. | Random Forest feature importance (0.176 on M2M contract; 0.139 on tenure). |
| **5. What retention actions should be prioritized?** | Proactive 1-year contract migration offers targeted at Month-to-Month first-year accounts. | **Strategy Lab Break-Even:** 4.1% conversion rate at $25/cust offer. |

---

## 2. Visual Architecture & Design Language

- **Editorial Dark Palette:** Deep midnight navy background (`#0B1020`) with layered surface cards (`#12182D`, `#161F38`, borders `#1E294B`).
- **High-Contrast Accents:** Electric Lime (`#C6F36A`) primary action color and Cool Cyan (`#38BDF8`) supporting analytics accent.
- **Calibrated Risk Spectrum:** Restrained emerald (`#10B981`) for Low Risk, amber (`#F59E0B`) for Medium Risk, coral-rose (`#F43F5E`) for High Risk.
- **Typography & Precision:** Inter system typography, crisp monospace metrics, high-legibility KPI figures, and generous whitespace.

---

## 3. Product Features & Dashboard Pages

### Page A: Executive Overview
- **Real Calculated KPIs:** Total customers (7,032), Churn rate (26.6%), Churned customers (1,869), Revenue lost to churn ($139,131/mo), High-risk accounts (1,770 accounts, $141,319/mo exposure).
- **Retention Pulse:** Dynamic health barometer derived from measured churn rate thresholds.
- **"What Matters Now":** Dynamic computed findings highlighting verified percentage-point deltas.
- **"Priority Retention Campaign":** Concrete strategic recommendation highlighting the first-year month-to-month cohort.
- **Interactive Visualizations:** Churn distribution donut, contract type breakdown, tenure hazard drop-off curve, payment method friction bar chart, and internet service comparisons.

### Page B: Churn Risk Explorer
- **Interactive Multi-Facet Filtering:** Filter instantly by Risk Band (Low ≤40% / Medium 40-70% / High >70%), Contract Type, Tenure Group, Payment Method, Internet Service, and Actual Churn outcome.
- **Real-Time Customer Search:** Instant search by Customer ID.
- **Dynamic Sorting & Pagination:** Sort by predicted probability, monthly charges, tenure, or customer ID.
- **Customer Intelligence Drawer:** Slide-over modal displaying full subscription profile, percentile ranking, personalized risk drivers vs protective factors, and recommended retention playbook.
- **CSV Query Export:** One-click download of the active filtered dataset.

### Page C: Churn Drivers & Explainability
- **Ranked Feature Importance:** Random Forest normalized Gini importance weights (top drivers: Month-to-month contract 0.176, tenure 0.139, TotalCharges 0.095, MonthlyCharges 0.090).
- **Directional Logistic Regression Coefficients:** Features that heighten churn hazard vs retention anchors.
- **Bivariate Segment Analysis:** Absolute percentage-point benchmark comparisons against the 26.6% company baseline.
- **Methodological Disclosure:** Explicit separation between statistical correlation and predictive attribution (no causal overstatement).

### Page D: Retention Strategy Lab (Signature Feature)
- **Cohort Targeting Presets:**
  1. *Month-to-Month High-Risk* (1,763 eligible accounts)
  2. *First-Year High-Risk* (886 eligible accounts)
  3. *High ARPU High-Risk ($70+/mo)* (1,232 eligible accounts)
  4. *All High-Risk Accounts* (1,770 eligible accounts)
- **User-Controlled Parameter Sliders:** Target customer volume limit, Offer incentive cost per customer ($5–$100), Assumed retention conversion rate (5%–60%).
- **Dynamic Financial Model:**
  - Total campaign budget ($)
  - Assumed retained customer volume
  - Estimated protected monthly recurring revenue ($/mo)
  - Estimated net monthly benefit ($/mo)
  - Exact break-even retention conversion rate (%)
  - Minimum customer volume needed to break even
  - ROI multiple (x)
- **Head-to-Head Cohort Benchmark Table:** Standardized comparison across all 4 strategy cohorts.

### Page E: Model Performance & Governance
- **Head-to-Head Model Evaluation:** Held-out 20% stratified test set (1,407 test accounts: 1,033 Stayed, 374 Churned).
- **Verified Model Results:**
  
  | Model | ROC-AUC | Precision (Churn) | Recall (Churn) | F1-Score | Accuracy |
  |---|---|---|---|---|---|
  | **Logistic Regression** | **0.835** | 49.2% | **80.2%** | **0.610** | 73.0% |
  | **Random Forest** | **0.835** | **52.5%** | 77.0% | **0.624** | **75.0%** |

- **Confusion Matrices:**
  - *Logistic Regression:* 723 True Negatives, 310 False Positives, 74 False Negatives, 300 True Positives.
  - *Random Forest:* 772 True Negatives, 261 False Positives, 86 False Negatives, 288 True Positives.
- **Interactive ROC Curves:** Plotted TPR vs FPR curves with random baseline (AUC = 0.50).
- **Decision Threshold Economics:** Analysis of why high recall (80.2%) is vital to prevent lost revenue, while precision controls offer budget efficiency.

---

## 4. Technology Stack & Directory Structure

```text
Customer-Churn-Analysis-and-Prediction/
├── backend/                         # FastAPI Application & Services
│   ├── app/
│   │   ├── main.py                  # API routes & static file hosting
│   │   ├── schemas.py               # Pydantic v2 data models
│   │   └── services/
│   │       ├── data_service.py      # Data loading, validation & risk banding
│   │       ├── analytics_service.py # KPI calculations & scenario simulator
│   │       └── ml_service.py        # ML evaluation & feature importance
│   └── tests/                       # Pytest Test Suite
│       ├── test_analytics.py        # Mathematical & financial unit tests
│       └── test_api.py              # API endpoint integration tests
├── frontend/                        # React + TypeScript + Vite Application
│   ├── src/
│   │   ├── components/              # Sidebar, Header, MetricCard, CustomerDrawer
│   │   ├── pages/                   # 5 Dashboard Pages
│   │   ├── services/api.ts          # Type-safe API client
│   │   └── types/index.ts           # Shared TypeScript interfaces
│   ├── dist/                        # Compiled production bundle
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── churn-analysis/                  # Data Science Pipeline
│   ├── data/
│   │   ├── raw/                     # Original CSV (git-ignored)
│   │   └── processed/churn_clean.csv# Cleaned dataset (7,032 records)
│   ├── outputs/                     # Predictions & evaluation files
│   ├── src/                         # Cleaning, EDA & training scripts
│   └── sql/churn_analysis.sql       # PostgreSQL analytical queries
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. How to Run Locally

### Prerequisites
- Python 3.9+
- Node.js 18+ and npm

### Quick Start (Single Unified Server)

1. **Activate Python Virtual Environment & Install Requirements:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install pandas numpy scikit-learn fastapi uvicorn pydantic pytest httpx matplotlib seaborn
   ```

2. **Run Data & ML Pipeline (if starting fresh):**
   ```bash
   cd churn-analysis
   python src/01_clean_data.py
   python src/03_train_model.py
   cd ..
   ```

3. **Build the Frontend (Already pre-built in `frontend/dist`):**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

4. **Start the RETAINIQ Application:**
   ```bash
   cd backend
   PYTHONPATH=. ../venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
   Open your browser to: **`http://127.0.0.1:8000`**

---

### Development Mode (Separate Hot-Reloading Frontend & Backend)

**Terminal 1 (Backend API):**
```bash
cd backend
PYTHONPATH=. ../venv/bin/uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend with Vite HMR):**
```bash
cd frontend
npm run dev
```
Open **`http://localhost:3000`** (Vite proxies all `/api` requests to port 8000).

---

## 6. Automated Testing & Data Consistency Audit

Run the comprehensive 18-test automated reconciliation suite:

```bash
cd backend
PYTHONPATH=. ../venv/bin/pytest -v
```

### Data Consistency & Mathematical Reconciliation Matrix

| Population Scope | Accounts | Retained | Churned | Churn Rate | Total MRR | High-Risk Accounts (>0.70) | High-Risk MRR Exposure | Reconciliation Status |
|---|---|---|---|---|---|---|---|---|
| **All Customers (Full DB)** | **7,032** | 5,163 (73.42%) | 1,869 (26.58%) | **26.58%** | **$455,661.00** | **1,770** (25.17%) | **$141,319.20** (31.01%) | **Verified 100%** |
| **Month-to-month Contract** | **3,875** | 2,220 (57.29%) | 1,655 (42.71%) | **42.71%** | **$257,294.15** | **1,763** (45.50%) | **$140,652.85** (54.67%) | **Verified 100%** |
| **One year Contract** | **1,472** | 1,306 (88.72%) | 166 (11.28%) | **11.28%** | **$93,892.40** | **7** (0.48%) | **$666.35** (0.71%) | **Verified 100%** |
| **Two year Contract** | **1,685** | 1,637 (97.15%) | 48 (2.85%) | **2.85%** | **$104,474.45** | **0** (0.00%) | **$0.00** (0.00%) | **Verified 100%** |

**Risk Band Reconciliation:**
- **Low Risk ($\le$ 0.40):** 3,539 accounts (50.33%), $197,878.80 MRR, 244 churned (6.89% churn rate)
- **Medium Risk (0.40 – 0.70):** 1,723 accounts (24.50%), $116,463.00 MRR, 511 churned (29.66% churn rate)
- **High Risk (> 0.70):** 1,770 accounts (25.17%), $141,319.20 MRR, 1,114 churned (62.94% churn rate)
- **Sum:** `3,539 + 1,723 + 1,770 = 7,032 accounts` (100.0%) and `$197,878.80 + $116,463.00 + $141,319.20 = $455,661.00` (100.0%)

**Test Coverage Highlights:**
- `test_data_integrity_and_uniqueness`: Verifies 7,032 records and zero duplicate customer IDs.
- `test_full_population_and_churn_reconciliation`: Validates 5,163 retained + 1,869 churned = 7,032; 26.58% churn rate.
- `test_standardized_risk_bands_reconciliation`: Validates Low (3,539), Medium (1,723), High (1,770) splits and $141,319.20 exposure.
- `test_month_to_month_filter_reconciliation`: Validates 2,220 retained + 1,655 churned = 3,875 (42.71% churn rate) and 1,763 high-risk accounts.
- `test_retention_funnel_filter_consistency`: Validates dynamic funnel steps across unfiltered and filtered scopes.
- `test_model_metrics_held_out_test_split`: Validates held-out 20% test split ROC-AUC 0.835, recall 0.802, precision 0.492, F1 0.610.
- `test_api_endpoints`: Integration tests for all REST endpoints, filter query params, 404 handlers, and CSV export streaming.

---

## 7. Deployment Guide

### Option A: Free / Low-Cost Container (Render, Railway, Fly.io, DigitalOcean)
Because FastAPI serves both the REST API and the compiled React SPA from `frontend/dist`, deployment requires only a single Docker container or Python service:

**Dockerfile:**
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY churn-analysis/ /app/churn-analysis/
COPY backend/ /app/backend/
COPY frontend/dist/ /app/frontend/dist/
RUN pip install --no-cache-dir pandas numpy scikit-learn fastapi uvicorn pydantic
EXPOSE 8000
WORKDIR /app/backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Option B: Decoupled Hosting (Vercel Frontend + Render Backend)
- **Frontend (Vercel):** Deploy `frontend/` directory with Build Command `npm run build` and Output Directory `dist`. Set environment variable `VITE_API_URL` to your backend URL.
- **Backend (Render / Railway):** Deploy `backend/` with start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

---

## 8. Limitations & Methodology Disclosures

1. **Snapshot Nature:** The IBM Telco dataset is a cross-sectional snapshot without longitudinal event logs. Churn cannot be modeled using survival analysis or time-series methods.
2. **Predictive vs. Causal:** High feature importance (e.g., month-to-month contracts) represents strong empirical correlation, not a randomized controlled trial.
3. **Illustrative ROI:** Retention campaign offer costs ($25) and conversion rates (20%) in the Strategy Lab are user-configurable assumptions designed for planning and sensitivity testing.

---

**Author:** Hemanth Chakravarthy Kancharla  
**Project:** RETAINIQ Customer Retention Command Center  
**License:** MIT
