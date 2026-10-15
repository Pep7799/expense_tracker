
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Expense, User
from app.schemas import ExpenseCreate, ExpenseResponse
from app.dependencies import get_current_user


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post(
    "/",
    response_model=ExpenseResponse,
    status_code=status.HTTP_201_CREATED
)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_expense = Expense(
        description=expense.description,
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        user_id=current_user.id
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


@router.get("/", response_model=list[ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id)
        .all()
    )


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = (
        db.query(Expense)
        .filter(
            Expense.id == expense_id,
            Expense.user_id == current_user.id
        )
        .first()
    )

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )

    return expense
