from sqlalchemy.orm import Session
from app.repositories.inventory_repository import inventory_repo
from app.repositories.transaction_repository import transaction_repo
from app.repositories.product_repository import product_repo
from app.schemas.inventory import InventoryUpdate, InventoryCreate
from app.schemas.transaction import TransactionCreate
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class InventoryService:
    @staticmethod
    def adjust_stock(
        db: Session,
        business_id: str,
        product_id: str,
        quantity: float,
        source: str,
        operation_id: str = None,
        operator_id: str = None,
    ):
        """
        Atomically adjusts stock and creates a transaction ledger record.
        """
        # 1. Idempotency Check
        if operation_id:
            existing_tx = transaction_repo.get_by_operation_id(
                db, business_id=business_id, operation_id=operation_id
            )
            if existing_tx:
                logger.info(f"Idempotency hit for operation {operation_id}. Returning existing transaction.")
                return existing_tx
                
        # 2. Validate Product belongs to Business
        product = product_repo.get(db, id=product_id)
        if not product or product.business_id != business_id:
            raise HTTPException(status_code=404, detail="Product not found")
            
        # 3. Lock Inventory Record
        inventory = inventory_repo.get_by_product_with_lock(db, product_id=product_id)
        prev_balance = inventory.current_stock if inventory else 0.0
        
        new_balance = prev_balance + quantity
        
        # Determine Type
        tx_type = "STOCK_IN" if quantity > 0 else ("STOCK_OUT" if quantity < 0 else "ADJUSTMENT")
        
        if new_balance < 0:
            raise HTTPException(status_code=400, detail="Insufficient stock")
            
        # 4. Update Inventory
        if inventory:
            inventory_repo.update(db, db_obj=inventory, obj_in=InventoryUpdate(current_stock=new_balance))
        else:
            inventory = inventory_repo.create(db, obj_in=InventoryCreate(product_id=product_id, current_stock=new_balance))
            
        # 5. Insert Transaction
        tx_in = TransactionCreate(
            product_id=product_id,
            type=tx_type,
            quantity=quantity,
            normalized_quantity=quantity, # Extend with TUNE logic later
            prev_balance=prev_balance,
            new_balance=new_balance,
            source=source,
            operation_id=operation_id
        )
        
        # Pass business_id to transaction repo (note that CRUDBase expects business_id as kwarg)
        transaction = transaction_repo.create(db, obj_in=tx_in, business_id=business_id)
        
        # Explicit commit to end the transaction
        db.commit()
        return transaction

inventory_service = InventoryService()
