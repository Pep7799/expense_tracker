from datetime import date

from pydantic import BaseModel, Field, EmailStr


class ExpenseCreate(BaseModel):
    description: str = Field(min_length=1, max_length=100)
    amount: float = Field(gt=0)
    category: str = Field(min_length=1, max_length=100)
    date: date


class ExpenseResponse(BaseModel):
    id: int
    description: str
    amount: float
    category: str 
    date: date

    model_config = {"from_attributes": True}
    

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=1, max_length=100)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str