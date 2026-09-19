from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate

class CRUDTransaction(CRUDBase[Transaction, TransactionCreate, TransactionCreate]):
    def get_multi_by_business(
        self, db: Session, *, business_id: str, skip: int = 0, limit: int = 100
    ) -> List[Transaction]:
        return (
            db.query(self.model)
            .filter(self.model.business_id == business_id)
            .order_by(self.model.timestamp.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_operation_id(self, db: Session, *, business_id: str, operation_id: str) -> Optional[Transaction]:
        if not operation_id:
            return None
        return db.query(self.model).filter(
            self.model.business_id == business_id,
            self.model.operation_id == operation_id
        ).first()

transaction_repo = CRUDTransaction(Transaction)
