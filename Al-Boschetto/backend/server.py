from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # Dolce, Bevande, Altro
    description: str
    image: str
    available: bool = True

class ProductCreate(BaseModel):
    name: str
    category: str
    description: str
    image: str
    available: bool = True

class ProductUpdate(BaseModel):
    available: Optional[bool] = None

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_number: str
    items: List[OrderItem]
    delivery_time: str
    status: str = "Ricevuto"  # Ricevuto, In Preparazione, Consegnato
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    read: bool = False

class OrderCreate(BaseModel):
    room_number: str
    items: List[OrderItem]
    delivery_time: str

class OrderStatusUpdate(BaseModel):
    status: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_number: str
    request_type: str  # Asciugamani, Wi-Fi, Pulizie, Altro
    message: str
    status: str = "In attesa"  # In attesa, Letto
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class MessageCreate(BaseModel):
    room_number: str
    request_type: str
    message: str

class MessageStatusUpdate(BaseModel):
    status: str

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None

class NotificationCount(BaseModel):
    new_orders: int
    new_messages: int

# ==================== ADMIN CREDENTIALS ====================
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "boschetto2024"

# ==================== PRODUCT ENDPOINTS ====================

@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/available", response_model=List[Product])
async def get_available_products():
    products = await db.products.find({"available": True}, {"_id": 0}).to_list(100)
    return products

@api_router.patch("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, update: ProductUpdate):
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    return product

# ==================== ORDER ENDPOINTS ====================

@api_router.post("/orders", response_model=Order)
async def create_order(order_input: OrderCreate):
    order = Order(**order_input.model_dump())
    doc = order.model_dump()
    await db.orders.insert_one(doc)
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return orders

@api_router.get("/orders/active", response_model=List[Order])
async def get_active_orders():
    orders = await db.orders.find(
        {"status": {"$ne": "Consegnato"}},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    return orders

@api_router.patch("/orders/{order_id}/status", response_model=Order)
async def update_order_status(order_id: str, update: OrderStatusUpdate):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": update.status, "read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return order

@api_router.patch("/orders/{order_id}/read")
async def mark_order_read(order_id: str):
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"success": True}

# ==================== MESSAGE ENDPOINTS ====================

@api_router.post("/messages", response_model=Message)
async def create_message(message_input: MessageCreate):
    message = Message(**message_input.model_dump())
    doc = message.model_dump()
    await db.messages.insert_one(doc)
    return message

@api_router.get("/messages", response_model=List[Message])
async def get_messages():
    messages = await db.messages.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return messages

@api_router.patch("/messages/{message_id}/status", response_model=Message)
async def update_message_status(message_id: str, update: MessageStatusUpdate):
    result = await db.messages.update_one(
        {"id": message_id},
        {"$set": {"status": update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message = await db.messages.find_one({"id": message_id}, {"_id": 0})
    return message

# ==================== ADMIN ENDPOINTS ====================

@api_router.post("/admin/login", response_model=AdminResponse)
async def admin_login(credentials: AdminLogin):
    if credentials.username == ADMIN_USERNAME and credentials.password == ADMIN_PASSWORD:
        token = str(uuid.uuid4())
        return AdminResponse(success=True, message="Login successful", token=token)
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.get("/notifications/count", response_model=NotificationCount)
async def get_notification_count():
    new_orders = await db.orders.count_documents({"read": False})
    new_messages = await db.messages.count_documents({"status": "In attesa"})
    return NotificationCount(new_orders=new_orders, new_messages=new_messages)

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return {"message": "Products already seeded", "count": count}
    
    products = [
        {"id": str(uuid.uuid4()), "name": "Cornetto Crema", "category": "Dolce", "description": "Cornetto confezionato con ripieno alla crema", "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Cornetto Cioccolato", "category": "Dolce", "description": "Cornetto confezionato con ripieno al cioccolato", "image": "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Cornetto Vuoto", "category": "Dolce", "description": "Cornetto confezionato classico", "image": "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Merendine", "category": "Dolce", "description": "Assortimento di merendine confezionate", "image": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Biscotti", "category": "Dolce", "description": "Biscotti confezionati assortiti", "image": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Fette Biscottate con Marmellata", "category": "Dolce", "description": "Fette biscottate con marmellata monoporzione", "image": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Fette Biscottate con Nutella", "category": "Dolce", "description": "Fette biscottate con Nutella monoporzione", "image": "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Succo Arancia", "category": "Bevande", "description": "Succo d'arancia confezionato", "image": "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Succo ACE", "category": "Bevande", "description": "Succo ACE confezionato", "image": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Succo Pesca", "category": "Bevande", "description": "Succo alla pesca confezionato", "image": "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Capsule Caffè", "category": "Bevande", "description": "Capsule compatibili Nespresso", "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Tè", "category": "Bevande", "description": "Bustine di tè assortite", "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Latte", "category": "Bevande", "description": "Latte UHT monoporzione", "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Yogurt", "category": "Altro", "description": "Yogurt alla frutta monoporzione", "image": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400", "available": True},
        {"id": str(uuid.uuid4()), "name": "Cereali Monoporzione", "category": "Altro", "description": "Cereali per colazione confezionati", "image": "https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?w=400", "available": True},
    ]
    
    await db.products.insert_many(products)
    return {"message": "Products seeded successfully", "count": len(products)}

@api_router.get("/")
async def root():
    return {"message": "Al Boschetto API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()