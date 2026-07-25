import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Vercel Serverless Functions have a read-only filesystem except for /tmp
if os.environ.get("VERCEL") == "1":
    SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/leakradar.db"
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./leakradar.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
