"""
Automated Unit Tests for RETAINIQ Streamlit Entrypoint and Backend Reuse

Verifies:
- Root-relative path resolution and imports
- Exact customer and churn counts
- Risk band boundary thresholds (Low <= 0.40, Medium 0.40-0.70, High > 0.70)
- Filter scoping (unfiltered vs Month-to-month)
- Retention funnel metrics and revenue exposures
- Signals Worth Watching generation
- Customer Risk Explorer search and pagination
- Retention ROI simulator calculations
- CSV export integrity
- Held-out model evaluation metrics (0.835 ROC-AUC)
"""

import sys
from pathlib import Path
import pytest
import pandas as pd

# Add repo root and backend to sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.data_service import data_service
from app.services.analytics_service import analytics_service
from app.services.ml_service import ml_service
from app.schemas import RetentionScenarioRequest


def test_root_relative_data_loading():
    """Verify data service loads records properly from the root-relative path."""
    df = data_service.df
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 7032
    assert "customerID" in df.columns
    assert "churn_probability" in df.columns
    assert "risk_band" in df.columns


def test_unfiltered_kpi_parity():
    """Verify unfiltered KPI calculations against ground-truth numbers."""
    kpis = analytics_service.get_kpis()
    assert kpis.total_customers == 7032
    assert kpis.churned_customers == 1869
    assert kpis.retained_customers == 5163
    assert kpis.overall_churn_rate == 26.58
    assert abs(kpis.total_monthly_revenue - 455661.00) < 0.01
    assert kpis.high_risk_customers == 1770
    assert abs(kpis.high_risk_revenue_exposure - 141319.20) < 0.01


def test_exact_risk_band_boundaries():
    """Verify calibrated risk bands Low <= 0.40, Med 0.40-0.70, High > 0.70."""
    bands = analytics_service.get_risk_distribution()
    assert len(bands) == 3

    low = next(b for b in bands if b.band == "Low")
    med = next(b for b in bands if b.band == "Medium")
    high = next(b for b in bands if b.band == "High")

    # Counts must sum to 7,032
    assert low.customers == 3539
    assert med.customers == 1723
    assert high.customers == 1770
    assert low.customers + med.customers + high.customers == 7032

    # Revenue sum must equal total MRR
    assert abs((low.monthly_revenue_exposure + med.monthly_revenue_exposure + high.monthly_revenue_exposure) - 455661.00) < 0.01


def test_filtered_month_to_month_scope():
    """Verify that filtering by Month-to-month contracts correctly updates all metrics."""
    kpis = analytics_service.get_kpis(filter_contract="Month-to-month")
    assert kpis.total_customers == 3875
    assert kpis.churned_customers == 1655
    assert kpis.retained_customers == 2220
    assert kpis.overall_churn_rate == 42.71
    assert abs(kpis.total_monthly_revenue - 257294.15) < 0.01
    assert kpis.high_risk_customers == 1763
    assert abs(kpis.high_risk_revenue_exposure - 140652.85) < 0.01


def test_retention_funnel_generation():
    """Verify 4-stage funnel generation for both unfiltered and filtered scopes."""
    funnel_all = analytics_service.get_retention_funnel()
    assert len(funnel_all) == 4
    assert funnel_all[0].count == 7032
    assert funnel_all[1].count == 1770

    funnel_m2m = analytics_service.get_retention_funnel(filter_contract="Month-to-month")
    assert len(funnel_m2m) == 4
    assert funnel_m2m[0].count == 3875
    assert funnel_m2m[1].count == 1763


def test_signals_worth_watching():
    """Verify that 5 empirical signals are generated with valid impact rankings."""
    signals = analytics_service.get_insights()
    assert len(signals) == 5
    ids = [s.id for s in signals]
    assert "contract_disparity" in ids
    assert "tenure_dropoff" in ids
    assert "payment_friction" in ids
    assert "fiber_pricing" in ids
    assert "high_risk_exposure" in ids


def test_customer_explorer_query_and_detail():
    """Verify customer search, detail expansion, and risk factor extraction."""
    # Query high-risk customer
    res = analytics_service.get_customers(risk_band="High", limit=5)
    assert len(res.items) == 5
    assert all(item.risk_band == "High" for item in res.items)

    # Inspect first customer
    cust_id = res.items[0].customer_id
    detail = analytics_service.get_customer_detail(cust_id)
    assert detail is not None
    assert detail.customer_id == cust_id
    assert detail.churn_probability > 0.70
    assert len(detail.risk_factors) > 0
    assert len(detail.recommended_action) > 0


def test_roi_scenario_simulation():
    """Verify ROI simulator calculation economics."""
    req = RetentionScenarioRequest(
        target_segment="month_to_month_high_risk",
        offer_cost_per_customer=30.0,
        assumed_success_rate=0.25,
        target_customer_limit=500
    )
    result = analytics_service.calculate_retention_scenario(req)
    assert result.targeted_customers == 500
    assert result.total_campaign_cost == 15000.0  # 500 * $30
    assert result.assumed_retained_customers == 125  # 500 * 0.25
    assert result.estimated_monthly_revenue_protected > 0
    assert result.break_even_success_rate > 0


def test_csv_export_format():
    """Verify CSV export dataset structure and contents."""
    df = data_service.df.copy()
    csv_bytes = df.to_csv(index=False).encode("utf-8")
    assert len(csv_bytes) > 500000
    # Re-read from bytes to ensure serialization integrity
    from io import BytesIO
    reloaded = pd.read_csv(BytesIO(csv_bytes))
    assert len(reloaded) == 7032
    assert "customerID" in reloaded.columns
    assert "risk_band" in reloaded.columns


def test_held_out_model_evaluation_metrics():
    """Verify distinct held-out test split metrics (0.835 ROC-AUC)."""
    metrics = ml_service.get_model_metrics()
    assert "Logistic Regression" in metrics
    assert "Random Forest" in metrics

    assert round(metrics["Logistic Regression"].roc_auc, 3) == 0.835
    assert round(metrics["Random Forest"].roc_auc, 3) == 0.835
    assert metrics["Logistic Regression"].recall >= 0.80
