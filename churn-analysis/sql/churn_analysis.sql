-- Telco Customer Churn analysis (PostgreSQL)

-- 1. Create the table and load the raw CSV --------------------------------
CREATE TABLE IF NOT EXISTS telco_churn (
    customer_id        TEXT PRIMARY KEY,
    gender             TEXT,
    senior_citizen     INT,
    partner            TEXT,
    dependents         TEXT,
    tenure             INT,
    phone_service      TEXT,
    multiple_lines     TEXT,
    internet_service   TEXT,
    online_security    TEXT,
    online_backup      TEXT,
    device_protection  TEXT,
    tech_support       TEXT,
    streaming_tv       TEXT,
    streaming_movies   TEXT,
    contract           TEXT,
    paperless_billing  TEXT,
    payment_method     TEXT,
    monthly_charges    NUMERIC(8,2),
    total_charges      TEXT,        -- has blank values, cleaned in the view below
    churn              TEXT
);

-- Run in psql from the project root:
-- \copy telco_churn FROM 'data/raw/WA_Fn-UseC_-Telco-Customer-Churn.csv' CSV HEADER

-- 2. Clean view ------------------------------------------------------------
CREATE OR REPLACE VIEW churn_clean AS
SELECT
    customer_id, gender, senior_citizen, partner, dependents, tenure,
    internet_service, contract, payment_method, monthly_charges,
    NULLIF(TRIM(total_charges), '')::NUMERIC AS total_charges,
    CASE WHEN churn = 'Yes' THEN 1 ELSE 0 END AS churned,
    CASE
        WHEN tenure <= 12 THEN '0-12 months'
        WHEN tenure <= 24 THEN '13-24 months'
        WHEN tenure <= 48 THEN '25-48 months'
        ELSE '49+ months'
    END AS tenure_group
FROM telco_churn
WHERE NULLIF(TRIM(total_charges), '') IS NOT NULL;

-- 3. Overall churn rate -----------------------------------------------------
SELECT COUNT(*) AS customers,
       SUM(churned) AS churned_customers,
       ROUND(100.0 * AVG(churned), 1) AS churn_rate_pct
FROM churn_clean;

-- 4. Churn by contract type -------------------------------------------------
SELECT contract,
       COUNT(*) AS customers,
       ROUND(100.0 * AVG(churned), 1) AS churn_rate_pct
FROM churn_clean
GROUP BY contract
ORDER BY churn_rate_pct DESC;

-- 5. Churn by tenure group --------------------------------------------------
SELECT tenure_group,
       COUNT(*) AS customers,
       ROUND(100.0 * AVG(churned), 1) AS churn_rate_pct
FROM churn_clean
GROUP BY tenure_group
ORDER BY churn_rate_pct DESC;

-- 6. Churn by payment method and internet service ---------------------------
SELECT payment_method,
       COUNT(*) AS customers,
       ROUND(100.0 * AVG(churned), 1) AS churn_rate_pct
FROM churn_clean
GROUP BY payment_method
ORDER BY churn_rate_pct DESC;

SELECT internet_service,
       COUNT(*) AS customers,
       ROUND(100.0 * AVG(churned), 1) AS churn_rate_pct
FROM churn_clean
GROUP BY internet_service
ORDER BY churn_rate_pct DESC;

-- 7. Revenue lost to churn (monthly) ----------------------------------------
SELECT ROUND(SUM(monthly_charges) FILTER (WHERE churned = 1), 0) AS monthly_revenue_lost,
       ROUND(100.0 * SUM(monthly_charges) FILTER (WHERE churned = 1)
             / SUM(monthly_charges), 1) AS pct_of_monthly_revenue
FROM churn_clean;

-- 8. Highest-risk segment: contract x tenure group (CTE + window function) ---
WITH segment AS (
    SELECT contract, tenure_group,
           COUNT(*) AS customers,
           ROUND(100.0 * AVG(churned), 1) AS churn_rate_pct
    FROM churn_clean
    GROUP BY contract, tenure_group
)
SELECT *,
       RANK() OVER (ORDER BY churn_rate_pct DESC) AS risk_rank
FROM segment
WHERE customers >= 50
ORDER BY risk_rank;
