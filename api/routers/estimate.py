from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class EstimateRequest(BaseModel):
    projectName: str
    projectType: str
    sqft: float
    budgetConstraint: Optional[float] = None
    location: Optional[str] = None


@router.post("/estimate")
async def estimate(data: EstimateRequest):
    if not data.projectName or not data.projectType or not data.sqft:
        raise HTTPException(status_code=400, detail="Missing required parameters")

    rate = 150 if data.projectType == "Renovation" else 350 if data.projectType == "Commercial Construction" else 220
    base_cost = data.sqft * rate
    est_budget = min(data.budgetConstraint, base_cost) if data.budgetConstraint else base_cost

    result = {
        "estimatedTotalBudget": est_budget,
        "breakdown": [
            {"item": "Materials & Equipment", "percentage": 40, "cost": int(est_budget * 0.4)},
            {"item": "Labor & Contracting", "percentage": 35, "cost": int(est_budget * 0.35)},
            {"item": "Permits, Licensing & Architectural Fees", "percentage": 12, "cost": int(est_budget * 0.12)},
            {"item": "Overhead & Logistics", "percentage": 8, "cost": int(est_budget * 0.08)},
            {"item": "Contingency Fund (5%)", "percentage": 5, "cost": int(est_budget * 0.05)},
        ],
        "materials": [
            {"name": "Structural Timber & Lumber pack", "quantity": "Bulk", "estimatedUnitCost": int(est_budget * 0.12)},
            {"name": "Premium Flooring & Tile", "quantity": "Sqft matching", "estimatedUnitCost": int(est_budget * 0.08)},
            {"name": "Electrical Copper Wiring, Panels & Fixtures suite", "quantity": "Package", "estimatedUnitCost": int(est_budget * 0.06)},
            {"name": "HVAC Unit, Ducting & Smart Ventilation package", "quantity": "1 System", "estimatedUnitCost": int(est_budget * 0.09)},
            {"name": "Drywall, Compound & Premium Base Coatings", "quantity": "Bulk loads", "estimatedUnitCost": int(est_budget * 0.05)},
        ],
        "milestones": [
            {"phase": "Planning & Permits Approval", "durationWeeks": 3, "deliverables": ["Secure building permits", "Register blueprints with local authorities"]},
            {"phase": "Demolition & Site prep", "durationWeeks": 2, "deliverables": ["Clear existing plumbing/partitions", "Disposal and grading"]},
            {"phase": "Rough-In MEP & Structural Framing", "durationWeeks": 4, "deliverables": ["Install partitions", "Run conduits and piping"]},
            {"phase": "Drywalling, Sheeting & Boarding", "durationWeeks": 2, "deliverables": ["Tape and sand drywall", "Install acoustic insulation"]},
            {"phase": "High-End Finishes, Trims & Final Inspection", "durationWeeks": 3, "deliverables": ["Tile installation", "Install smart light fixtures", "Pass occupancy audit"]},
        ],
        "aiTips": [
            f"Consider batch-purchasing custom fixtures from local fabricators to save up to 12% on luxury markup near the {data.location or 'construction site'}.",
            "Perform rough inspections early in week 5 to ensure subsequent tasks are not delayed by schedule backlogs.",
            "Keep high reserves for Contingency, especially when doing premium renovations in highly regulated microstructures.",
        ],
    }
    return {"success": True, "data": result}
