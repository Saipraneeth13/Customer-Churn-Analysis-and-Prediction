from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["records"] == 7032

def test_metadata():
    response = client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "last_updated" in data
    assert data["record_count"] == 7032

def test_overview():
    response = client.get("/api/overview")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "insights" in data
    assert "risk_distribution" in data
    assert data["kpis"]["total_customers"] == 7032
    assert len(data["insights"]) >= 3

def test_churn_by_segment():
    response = client.get("/api/churn-by-segment?dimension=Contract")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert any(item["segment_name"] == "Month-to-month" for item in data)

def test_customers_pagination_and_filter():
    response = client.get("/api/customers?limit=10&page=1&risk_band=High")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 10
    assert data["page"] == 1
    assert data["limit"] == 10
    assert all(item["risk_band"] == "High" for item in data["items"])

def test_customer_detail_found_and_not_found():
    # Valid customer
    response = client.get("/api/customers?limit=1")
    first_id = response.json()["items"][0]["customer_id"]

    res_detail = client.get(f"/api/customers/{first_id}")
    assert res_detail.status_code == 200
    assert res_detail.json()["customer_id"] == first_id

    # Nonexistent customer
    res_fake = client.get("/api/customers/NONEXISTENT_9999")
    assert res_fake.status_code == 404

def test_model_performance():
    response = client.get("/api/model-performance")
    assert response.status_code == 200
    data = response.json()
    assert "Logistic Regression" in data
    assert "Random Forest" in data
    assert data["Logistic Regression"]["roc_auc"] > 0.80
    assert data["Random Forest"]["roc_auc"] > 0.80
    assert len(data["Logistic Regression"]["roc_curve"]) > 10

def test_churn_drivers():
    response = client.get("/api/churn-drivers")
    assert response.status_code == 200
    data = response.json()
    assert "random_forest" in data
    assert "logistic_regression" in data
    assert len(data["random_forest"]) > 0

def test_retention_scenario_post():
    payload = {
        "target_segment": "all_high_risk",
        "offer_cost_per_customer": 20.0,
        "assumed_success_rate": 0.15
    }
    response = client.post("/api/retention-scenario", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["eligible_customers"] > 0
    assert data["total_campaign_cost"] > 0

def test_export_customers():
    response = client.get("/api/export/customers?risk_band=High")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    lines = response.text.strip().split("\n")
    assert len(lines) > 1  # Header + items
    assert "CustomerID" in lines[0]
