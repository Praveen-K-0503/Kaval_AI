import json
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    """Verify health check endpoint returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "kaavalai-api"}

def test_auth_registration_and_login():
    """Verify user registration and successful JWT login."""
    test_user = {
        "email": "test_officer@ksp.gov.in",
        "password": "securepassword",
        "role": "analyst"
    }
    
    # Try registration
    response = client.post("/api/auth/register", json=test_user)
    # Registration returns 200 OK or 400 if user exists (which is fine)
    assert response.status_code in [200, 400]
    
    # Try login
    login_response = client.post("/api/auth/login", json=test_user)
    assert login_response.status_code == 200
    data = login_response.json()
    assert "token" in data
    assert data["email"] == test_user["email"]
    assert data["role"] == test_user["role"]

def test_crud_fir():
    """Verify creating, updating, and deleting an FIR."""
    new_fir = {
        "CrimeNo": "FIR-TEST-001",
        "CaseNo": "CASE-TEST-001",
        "PoliceStationID": 1,
        "GravityOffenceID": 1,
        "CrimeRegisteredDate": "2026-07-26",
        "IncidentFromDate": "2026-07-26 10:00:00",
        "IncidentToDate": "2026-07-26 11:00:00",
        "latitude": 12.97,
        "longitude": 77.59,
        "BriefFacts": "This is a unit test case registered for operational validation.",
        "CaseStatusID": 1,
        "PolicePersonID": 1
    }
    
    # Create
    create_res = client.post("/api/firs", json=new_fir)
    assert create_res.status_code == 200
    data = create_res.json()
    assert data["status"] == "success"
    case_master_id = data["CaseMasterID"]
    
    # Update
    new_fir["BriefFacts"] = "Updated brief facts for validation."
    update_res = client.put(f"/api/firs/{case_master_id}", json=new_fir)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "success"
    
    # Delete
    delete_res = client.delete(f"/api/firs/{case_master_id}")
    assert delete_res.status_code == 200
    assert delete_res.json()["status"] == "success"
