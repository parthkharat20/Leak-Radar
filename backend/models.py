from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Core requested fields
    service_name = Column(String, index=True)
    amount = Column(Float)
    frequency = Column(String)
    status = Column(String, default="Active")
    action_plan = Column(String, default="Keep")
    leak_score = Column(Integer)
    is_price_hike = Column(Boolean, default=False)
    
    # Raw JSON data to power the dashboard without schema bloat
    raw_data = Column(JSON)

    user = relationship("User", back_populates="subscriptions")
