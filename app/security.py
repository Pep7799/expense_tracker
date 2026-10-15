import os
from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()

# Set a real secret key in your environment before deploying.
SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-change-this-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None
) -> str:
    to_encode = data.copy()

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
