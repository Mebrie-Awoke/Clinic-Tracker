 
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional
import pandas as pd
from io import BytesIO

# ============= DATABASE SETUP =============
SQLALCHEMY_DATABASE_URL = "sqlite:///./clinic_data.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ============= DATABASE MODELS =============
class DailyLog(Base):
    __tablename__ = "daily_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, nullable=False)
    total_patients = Column(Integer, default=0)
    total_revenue = Column(Float, default=0.0)
    total_expenses = Column(Float, default=0.0)
    profit = Column(Float, default=0.0)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship with diseases
    diseases = relationship("DiseaseBreakdown", back_populates="log", cascade="all, delete-orphan")

class DiseaseBreakdown(Base):
    __tablename__ = "disease_breakdown"
    
    id = Column(Integer, primary_key=True, index=True)
    log_id = Column(Integer, ForeignKey("daily_logs.id"))
    disease_name = Column(String, nullable=False)
    case_count = Column(Integer, default=1)
    
    log = relationship("DailyLog", back_populates="diseases")

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    drug_name = Column(String, unique=True, nullable=False)
    quantity_in_stock = Column(Integer, default=0)
    reorder_level = Column(Integer, default=10)
    unit_cost = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    expiry_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# ============= PYDANTIC SCHEMAS =============
class DiseaseCreate(BaseModel):
    disease_name: str
    case_count: int = 1

class DailyLogCreate(BaseModel):
    date: date
    total_patients: int
    total_revenue: float
    total_expenses: float
    notes: Optional[str] = None
    diseases: List[DiseaseCreate] = []

class DailyLogResponse(BaseModel):
    id: int
    date: date
    total_patients: int
    total_revenue: float
    total_expenses: float
    profit: float
    notes: Optional[str]
    diseases: List[DiseaseCreate]
    
    class Config:
        from_attributes = True  

class InventoryCreate(BaseModel):
    drug_name: str
    quantity_in_stock: int
    reorder_level: int = 10
    unit_cost: float = 0.0
    selling_price: float = 0.0
    expiry_date: Optional[date] = None

class InventoryResponse(BaseModel):
    id: int
    drug_name: str
    quantity_in_stock: int
    reorder_level: int
    unit_cost: float
    selling_price: float
    expiry_date: Optional[date]
    status: str
    
    class Config:
        from_attributes = True  
class DashboardSummary(BaseModel):
    total_patients_month: int
    total_revenue_month: float
    total_expenses_month: float
    total_profit_month: float
    total_patients_all: int
    total_revenue_all: float
    total_profit_all: float
    avg_daily_profit: float
    top_diseases: List[dict]
    critical_stock: List[dict]

# ============= DEPENDENCY =============
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============= FASTAPI APP =============
app = FastAPI(title="Wereda Clinic Tracker", version="1.0.0")

# CORS - allows React to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============= API ENDPOINTS =============

# ----- DAILY LOGS -----
@app.post("/api/daily-logs", response_model=DailyLogResponse)
def create_daily_log(log_data: DailyLogCreate, db: Session = Depends(get_db)):
    # Check if log for this date already exists
    existing = db.query(DailyLog).filter(DailyLog.date == log_data.date).first()
    if existing:
        raise HTTPException(status_code=400, detail="Log for this date already exists")
    
    # Calculate profit
    profit = log_data.total_revenue - log_data.total_expenses
    
    # Create log
    db_log = DailyLog(
        date=log_data.date,
        total_patients=log_data.total_patients,
        total_revenue=log_data.total_revenue,
        total_expenses=log_data.total_expenses,
        profit=profit,
        notes=log_data.notes
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    # Add diseases
    for disease in log_data.diseases:
        db_disease = DiseaseBreakdown(
            log_id=db_log.id,
            disease_name=disease.disease_name,
            case_count=disease.case_count
        )
        db.add(db_disease)
    
    db.commit()
    db.refresh(db_log)
    
    return db_log

@app.get("/api/daily-logs")
def get_daily_logs(start_date: Optional[date] = None, end_date: Optional[date] = None, db: Session = Depends(get_db)):
    query = db.query(DailyLog)
    
    if start_date:
        query = query.filter(DailyLog.date >= start_date)
    if end_date:
        query = query.filter(DailyLog.date <= end_date)
    
    logs = query.order_by(DailyLog.date.desc()).all()
    
    # Format response with diseases
    result = []
    for log in logs:
        diseases = [{"disease_name": d.disease_name, "case_count": d.case_count} for d in log.diseases]
        result.append({
            "id": log.id,
            "date": log.date,
            "total_patients": log.total_patients,
            "total_revenue": log.total_revenue,
            "total_expenses": log.total_expenses,
            "profit": log.profit,
            "notes": log.notes,
            "diseases": diseases
        })
    
    return result

@app.get("/api/daily-logs/{log_id}")
def get_daily_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    diseases = [{"disease_name": d.disease_name, "case_count": d.case_count} for d in log.diseases]
    return {
        "id": log.id,
        "date": log.date,
        "total_patients": log.total_patients,
        "total_revenue": log.total_revenue,
        "total_expenses": log.total_expenses,
        "profit": log.profit,
        "notes": log.notes,
        "diseases": diseases
    }

@app.delete("/api/daily-logs/{log_id}")
def delete_daily_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(DailyLog).filter(DailyLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db.delete(log)
    db.commit()
    return {"message": "Log deleted successfully"}

# ----- INVENTORY -----
@app.post("/api/inventory", response_model=InventoryResponse)
def create_inventory_item(item: InventoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Inventory).filter(Inventory.drug_name == item.drug_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Drug already exists in inventory")
    
    db_item = Inventory(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return get_inventory_item_with_status(db_item)

@app.get("/api/inventory")
def get_inventory(db: Session = Depends(get_db)):
    items = db.query(Inventory).all()
    return [get_inventory_item_with_status(item) for item in items]

@app.put("/api/inventory/{item_id}")
def update_inventory(item_id: int, quantity_delta: int, db: Session = Depends(get_db)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    item.quantity_in_stock += quantity_delta
    if item.quantity_in_stock < 0:
        item.quantity_in_stock = 0
    
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    
    return get_inventory_item_with_status(item)

@app.delete("/api/inventory/{item_id}")
def delete_inventory_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    db.delete(item)
    db.commit()
    return {"message": "Item deleted successfully"}

def get_inventory_item_with_status(item):
    if item.quantity_in_stock <= 0:
        status = "Critical"
    elif item.quantity_in_stock <= item.reorder_level:
        status = "Low"
    else:
        status = "Good"
    
    return {
        "id": item.id,
        "drug_name": item.drug_name,
        "quantity_in_stock": item.quantity_in_stock,
        "reorder_level": item.reorder_level,
        "unit_cost": item.unit_cost,
        "selling_price": item.selling_price,
        "expiry_date": item.expiry_date,
        "status": status
    }

# ----- DASHBOARD -----
@app.get("/api/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # Current month
    today = date.today()
    first_day_of_month = date(today.year, today.month, 1)
    
    month_logs = db.query(DailyLog).filter(DailyLog.date >= first_day_of_month).all()
    all_logs = db.query(DailyLog).all()
    
    # Month totals
    total_patients_month = sum(log.total_patients for log in month_logs)
    total_revenue_month = sum(log.total_revenue for log in month_logs)
    total_expenses_month = sum(log.total_expenses for log in month_logs)
    total_profit_month = total_revenue_month - total_expenses_month
    
    # All-time totals
    total_patients_all = sum(log.total_patients for log in all_logs)
    total_revenue_all = sum(log.total_revenue for log in all_logs)
    total_profit_all = sum(log.profit for log in all_logs)
    
    # Average daily profit
    avg_daily_profit = total_profit_all / len(all_logs) if all_logs else 0
    
    # Top diseases (last 30 days)
    thirty_days_ago = date.today() - pd.Timedelta(days=30)
    disease_query = db.query(DiseaseBreakdown).join(DailyLog).filter(DailyLog.date >= thirty_days_ago).all()
    
    disease_counts = {}
    for d in disease_query:
        disease_counts[d.disease_name] = disease_counts.get(d.disease_name, 0) + d.case_count
    
    top_diseases = sorted(disease_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    top_diseases_formatted = [{"disease": name, "count": count} for name, count in top_diseases]
    
    # Critical stock alerts
    critical_stock = []
    inventory_items = db.query(Inventory).all()
    for item in inventory_items:
        if item.quantity_in_stock <= item.reorder_level:
            critical_stock.append({
                "drug": item.drug_name,
                "current_stock": item.quantity_in_stock,
                "reorder_level": item.reorder_level
            })
    
    return {
        "total_patients_month": total_patients_month,
        "total_revenue_month": total_revenue_month,
        "total_expenses_month": total_expenses_month,
        "total_profit_month": total_profit_month,
        "total_patients_all": total_patients_all,
        "total_revenue_all": total_revenue_all,
        "total_profit_all": total_profit_all,
        "avg_daily_profit": round(avg_daily_profit, 2),
        "top_diseases": top_diseases_formatted,
        "critical_stock": critical_stock
    }

@app.get("/api/dashboard/monthly-trends")
def get_monthly_trends(db: Session = Depends(get_db)):
    # Get last 12 months of data
    one_year_ago = date.today() - pd.Timedelta(days=365)
    logs = db.query(DailyLog).filter(DailyLog.date >= one_year_ago).all()
    
    # Group by month
    df = pd.DataFrame([{
        "date": log.date,
        "revenue": log.total_revenue,
        "expenses": log.total_expenses,
        "profit": log.profit,
        "patients": log.total_patients
    } for log in logs])
    
    if df.empty:
        return {"months": [], "revenue": [], "expenses": [], "profit": [], "patients": []}
    
    df['month'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m')
    monthly = df.groupby('month').agg({
        'revenue': 'sum',
        'expenses': 'sum',
        'profit': 'sum',
        'patients': 'sum'
    }).reset_index()
    
    return {
        "months": monthly['month'].tolist(),
        "revenue": monthly['revenue'].tolist(),
        "expenses": monthly['expenses'].tolist(),
        "profit": monthly['profit'].tolist(),
        "patients": monthly['patients'].tolist()
    }

# ============= RUN THE SERVER =============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)