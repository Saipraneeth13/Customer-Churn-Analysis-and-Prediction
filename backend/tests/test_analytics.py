import pytest
import pandas as pd
from app.services.analytics_service import analytics_service
from app.services.data_service import data_service
from app.services.ml_service import ml_service
from app.schemas import RetentionScenarioRequest

def test_data_integrity_and_uniqueness():
    df = data_service.df
    # Exactly 7,032 records
    assert len(df) == 7032
    # Exactly 7,032 unique customer IDs (no duplicates)
    assert df["customerID"].nunique() == 7032
    # Core fields present with zero nulls
    for col in ["customerID", "Churn", "MonthlyCharges", "tenure", "Contract", "churn_probability", "risk_band"]:
        assert col in df.columns
        assert df[col].isnull().sum() == 0

def test_full_population_and_churn_reconciliation():
    kpis = analytics_service.get_kpis()
    # Customer reconciliation: Retained + Churned == Total
    assert kpis.total_customers == 7032
    assert kpis.churned_customers == 1869
    assert kpis.retained_customers == 5163
    assert kpis.retained_customers + kpis.churned_customers == kpis.total_customers

    # Churn rate 1869 / 7032 = 26.58%
    assert kpis.overall_churn_rate == 26.58

    # Revenue reconciliation: Total MRR = $455,661.00
    assert abs(kpis.total_monthly_revenue - 455661.00) < 0.01

    # Actual historical churned revenue lost = $139,130.85
    assert abs(kpis.actual_churn_revenue_lost - 139130.85) < 0.01

    # High-risk segment (standardized 03_train_model.py threshold: prob > 0.70)
    assert kpis.high_risk_customers == 1770
    assert abs(kpis.high_risk_revenue_exposure - 141319.20) < 0.01
    assert abs(kpis.monthly_revenue_at_risk_pct - 31.01) < 0.05

def test_standardized_risk_bands_reconciliation():
    bands = analytics_service.get_risk_distribution()
    assert len(bands) == 3

    # Band names & ranges
    low_band = next(b for b in bands if b.band == "Low")
    med_band = next(b for b in bands if b.band == "Medium")
    high_band = next(b for b in bands if b.band == "High")

    # Customer counts: 3,539 + 1,723 + 1,770 == 7,032
    assert low_band.customers == 3539
    assert med_band.customers == 1723
    assert high_band.customers == 1770
    assert low_band.customers + med_band.customers + high_band.customers == 7032

    # Revenue exposure sum == Total MRR ($455,661.00)
    total_band_rev = round(low_band.monthly_revenue_exposure + med_band.monthly_revenue_exposure + high_band.monthly_revenue_exposure, 2)
    assert abs(total_band_rev - 455661.00) < 0.01
    assert abs(high_band.monthly_revenue_exposure - 141319.20) < 0.01

    # Churned counts sum == Total churned (1,869)
    total_churned_in_bands = low_band.churned_in_band + med_band.churned_in_band + high_band.churned_in_band
    assert total_churned_in_bands == 1869

    # Band churn rates: High > 60%, Medium ~30%, Low < 10%
    assert high_band.churn_rate_in_band == 62.9
    assert med_band.churn_rate_in_band == 29.7
    assert low_band.churn_rate_in_band == 6.9

def test_month_to_month_filter_reconciliation():
    # Filtered scope: Month-to-month contracts
    kpis = analytics_service.get_kpis(filter_contract="Month-to-month")
    bands = analytics_service.get_risk_distribution(filter_contract="Month-to-month")

    # Customer count: exactly 3,875 accounts
    assert kpis.total_customers == 3875
    assert kpis.churned_customers == 1655
    assert kpis.retained_customers == 2220
    assert kpis.retained_customers + kpis.churned_customers == 3875
    assert kpis.overall_churn_rate == 42.71

    # Revenue in Month-to-month scope
    assert abs(kpis.total_monthly_revenue - 257294.15) < 0.01
    assert kpis.high_risk_customers == 1763
    assert abs(kpis.high_risk_revenue_exposure - 140652.85) < 0.01

    # Risk bands within Month-to-month sum to 3,875
    assert sum(b.customers for b in bands) == 3875
    high_band_m2m = next(b for b in bands if b.band == "High")
    assert high_band_m2m.customers == 1763
    assert abs(high_band_m2m.monthly_revenue_exposure - 140652.85) < 0.01

def test_retention_funnel_filter_consistency():
    # Unfiltered
    funnel_all = analytics_service.get_retention_funnel()
    assert funnel_all[0].count == 7032
    assert funnel_all[1].count == 1770

    # Filtered by Month-to-month
    funnel_m2m = analytics_service.get_retention_funnel(filter_contract="Month-to-month")
    assert funnel_m2m[0].count == 3875
    assert funnel_m2m[1].count == 1763

def test_model_metrics_held_out_test_split():
    # Verifies held-out 20% test split evaluation matches outputs/model_metrics.csv
    perf = ml_service.get_model_metrics()
    lr = perf["Logistic Regression"]
    rf = perf["Random Forest"]

    assert round(lr.roc_auc, 3) == 0.835
    assert round(lr.recall, 3) == 0.802
    assert round(lr.precision, 3) == 0.492
    assert round(lr.f1_score, 3) == 0.610

    assert round(rf.roc_auc, 3) == 0.835
    assert round(rf.recall, 3) == 0.770
    assert round(rf.precision, 3) == 0.525
    assert round(rf.f1_score, 3) == 0.624

def test_customer_detail_and_factors():
    df = data_service.df
    high_risk_id = df[df["risk_band"] == "High"].iloc[0]["customerID"]
    detail = analytics_service.get_customer_detail(high_risk_id)
    assert detail is not None
    assert detail.customer_id == high_risk_id
    assert detail.churn_probability > 0.70
    assert len(detail.risk_factors) > 0
    assert detail.recommended_action is not None

def test_retention_scenario_simulation():
    req = RetentionScenarioRequest(
        target_segment="month_to_month_high_risk",
        offer_cost_per_customer=30.0,
        assumed_success_rate=0.25,
        target_customer_limit=500
    )
    res = analytics_service.calculate_retention_scenario(req)
    assert res.targeted_customers == 500
    assert res.total_campaign_cost == 500 * 30.0  # $15,000
    assert res.assumed_retained_customers == int(500 * 0.25)  # 125 customers
    expected_protected = round(125 * res.average_monthly_charges, 2)
    assert abs(res.estimated_monthly_revenue_protected - expected_protected) < 1.0
    assert res.estimated_net_benefit == round(res.estimated_monthly_revenue_protected - res.total_campaign_cost, 2)
    assert res.break_even_success_rate > 0.0
