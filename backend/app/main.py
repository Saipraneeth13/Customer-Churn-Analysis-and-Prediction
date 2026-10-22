import io
import csv
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.schemas import (
    KPISummary, KeyInsight, SegmentMetric, CustomerItem, CustomerDetail,
    CustomersResponse, RiskBandSummary, RetentionScenarioRequest, RetentionScenarioResponse,
    ModelMetrics, FeatureImportanceItem, MetadataResponse, MonthlyChargeBand, HistogramBin, FunnelStep
)
from app.services.data_service import data_service
from app.services.analytics_service import analytics_service
from app.services.ml_service import ml_service

app = FastAPI(
    title="RETAINIQ API",
    description="Customer Retention Command Center - Analytics & ML Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "RETAINIQ", "records": len(data_service.df)}

@app.get("/api/metadata", response_model=MetadataResponse)
def get_metadata():
    return MetadataResponse(
        last_updated=data_service.last_loaded,
        dataset_name="IBM Telco Customer Churn",
        record_count=len(data_service.df),
        model_version="Scikit-Learn (LogisticRegression & RandomForestClassifier)",
        status="active"
    )

@app.post("/api/reload")
def reload_data():
    data_service.load_data()
    return {"status": "reloaded", "records": len(data_service.df), "last_updated": data_service.last_loaded}

@app.get("/api/overview")
def get_overview(
    contract: Optional[str] = None,
    tenure_group: Optional[str] = None
):
    kpis = analytics_service.get_kpis(filter_contract=contract, filter_tenure_group=tenure_group)
    insights = analytics_service.get_insights()
    risk_dist = analytics_service.get_risk_distribution(filter_contract=contract, filter_tenure_group=tenure_group)
    charges_dist = analytics_service.get_monthly_charges_distribution(filter_contract=contract, filter_tenure_group=tenure_group)
    histogram = analytics_service.get_probability_histogram(filter_contract=contract, filter_tenure_group=tenure_group)
    funnel = analytics_service.get_retention_funnel(filter_contract=contract, filter_tenure_group=tenure_group)
    return {
        "kpis": kpis,
        "insights": insights,
        "risk_distribution": risk_dist,
        "monthly_charges_distribution": charges_dist,
        "probability_histogram": histogram,
        "retention_funnel": funnel,
        "last_updated": data_service.last_loaded
    }

@app.get("/api/churn-by-segment", response_model=List[SegmentMetric])
def get_churn_by_segment(
    dimension: str = Query("Contract", description="Contract, tenure_group, PaymentMethod, InternetService, MultipleLines, TechSupport"),
    contract: Optional[str] = None,
    tenure_group: Optional[str] = None
):
    return analytics_service.get_segment_metrics(dimension, filter_contract=contract, filter_tenure_group=tenure_group)

@app.get("/api/monthly-charges-distribution", response_model=List[MonthlyChargeBand])
def get_monthly_charges_distribution(
    contract: Optional[str] = None,
    tenure_group: Optional[str] = None
):
    return analytics_service.get_monthly_charges_distribution(filter_contract=contract, filter_tenure_group=tenure_group)

@app.get("/api/probability-histogram", response_model=List[HistogramBin])
def get_probability_histogram(
    contract: Optional[str] = None,
    tenure_group: Optional[str] = None
):
    return analytics_service.get_probability_histogram(filter_contract=contract, filter_tenure_group=tenure_group)

@app.get("/api/retention-funnel", response_model=List[FunnelStep])
def get_retention_funnel(
    contract: Optional[str] = None,
    tenure_group: Optional[str] = None
):
    return analytics_service.get_retention_funnel(filter_contract=contract, filter_tenure_group=tenure_group)

@app.get("/api/risk-distribution", response_model=List[RiskBandSummary])
def get_risk_distribution(
    contract: Optional[str] = None,
    tenure_group: Optional[str] = None
):
    return analytics_service.get_risk_distribution(filter_contract=contract, filter_tenure_group=tenure_group)

@app.get("/api/customers", response_model=CustomersResponse)
def get_customers(
    search: Optional[str] = None,
    risk_band: Optional[str] = None,
    contract: Optional[str] = None,
    tenure_group: Optional[str] = None,
    internet_service: Optional[str] = None,
    payment_method: Optional[str] = None,
    actual_churn: Optional[int] = None,
    min_monthly_charges: Optional[float] = None,
    max_monthly_charges: Optional[float] = None,
    sort_by: str = Query("churn_probability", description="churn_probability, monthly_charges, tenure, total_charges, customer_id"),
    sort_desc: bool = True,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200)
):
    return analytics_service.get_customers(
        search=search,
        risk_band=risk_band,
        contract=contract,
        tenure_group=tenure_group,
        internet_service=internet_service,
        payment_method=payment_method,
        actual_churn=actual_churn,
        min_monthly_charges=min_monthly_charges,
        max_monthly_charges=max_monthly_charges,
        sort_by=sort_by,
        sort_desc=sort_desc,
        page=page,
        limit=limit
    )

@app.get("/api/customers/{customer_id}", response_model=CustomerDetail)
def get_customer_detail(customer_id: str):
    detail = analytics_service.get_customer_detail(customer_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Customer ID {customer_id} not found")
    return detail

@app.get("/api/churn-drivers")
def get_churn_drivers():
    rf_drivers = ml_service.get_feature_importance("rf")
    lr_drivers = ml_service.get_feature_importance("lr")
    return {
        "random_forest": rf_drivers[:15],
        "logistic_regression": lr_drivers[:15]
    }

@app.get("/api/model-performance", response_model=Dict[str, ModelMetrics])
def get_model_performance():
    return ml_service.get_model_metrics()

@app.post("/api/retention-scenario", response_model=RetentionScenarioResponse)
def simulate_retention_scenario(request: RetentionScenarioRequest):
    return analytics_service.calculate_retention_scenario(request)

@app.get("/api/export/customers")
def export_customers_csv(
    search: Optional[str] = None,
    risk_band: Optional[str] = None,
    contract: Optional[str] = None,
    tenure_group: Optional[str] = None,
    internet_service: Optional[str] = None,
    payment_method: Optional[str] = None,
    actual_churn: Optional[int] = None
):
    data = analytics_service.get_customers(
        search=search,
        risk_band=risk_band,
        contract=contract,
        tenure_group=tenure_group,
        internet_service=internet_service,
        payment_method=payment_method,
        actual_churn=actual_churn,
        sort_by="churn_probability",
        sort_desc=True,
        page=1,
        limit=10000
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "CustomerID", "Gender", "SeniorCitizen", "Partner", "Dependents",
        "Tenure", "TenureGroup", "Contract", "PaymentMethod", "InternetService",
        "MonthlyCharges", "TotalCharges", "ActualChurn", "ChurnProbability", "RiskBand"
    ])

    for item in data.items:
        writer.writerow([
            item.customer_id, item.gender, item.senior_citizen, item.partner, item.dependents,
            item.tenure, item.tenure_group, item.contract, item.payment_method, item.internet_service,
            item.monthly_charges, item.total_charges, item.actual_churn, item.churn_probability, item.risk_band
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="retainiq_customers_export.csv"'}
    )

# Static file serving for single-deployment mode
FRONTEND_DIST = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
