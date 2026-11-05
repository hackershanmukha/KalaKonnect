from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Store
from ..services.advisor_agent import AIBusinessAdvisorAgent
from ..dependencies import require_vendor_store
from ..schemas import AdvisorChatRequest, AdvisorChatResponse

router = APIRouter(prefix="/advisor", tags=["AI Business Advisor"])

@router.post("/chat", response_model=AdvisorChatResponse)
def advisor_chat(
    req: AdvisorChatRequest,
    store: Store = Depends(require_vendor_store),
    db: Session = Depends(get_db)
):
    result = AIBusinessAdvisorAgent.execute_chat(
        db=db,
        store_id=store.id,
        message=req.message,
        conversation_history=req.conversation_history
    )
    return AdvisorChatResponse(
        reply=result["reply"],
        data_points=result.get("data_points"),
        suggested_followups=result.get("suggested_followups", [])
    )

