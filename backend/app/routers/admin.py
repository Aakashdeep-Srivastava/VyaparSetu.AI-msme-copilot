from fastapi import APIRouter
from app.models.schemas import OverrideRequest, OverrideResponse, DashboardMetrics
from app.models.database import add_override, get_dashboard_data

router = APIRouter()

@router.get("/dashboard")
async def dashboard():
    return get_dashboard_data()

@router.post("/override", response_model=OverrideResponse)
async def override(request: OverrideRequest):
    audit_id = add_override({
        "record_id": request.record_id,
        "field": request.field,
        "old_value": request.old_value,
        "new_value": request.new_value,
        "reason": request.reason,
        "admin_id": request.admin_id,
    })
    return OverrideResponse(
        success=True,
        record_id=request.record_id,
        audit_id=audit_id,
        message=f"Override applied. {request.field} changed from '{request.old_value}' to '{request.new_value}'."
    )
