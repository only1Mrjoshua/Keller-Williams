from datetime import date, datetime
import os
import shutil
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel, EmailStr, ConfigDict
from bson import ObjectId

# Import your existing database setup
from database import get_database

# ---------------------------
# Contact Messages Models
# ---------------------------
class ContactMessageBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    message: str

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessageResponse(ContactMessageBase):
    id: str
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={ObjectId: str}
    )

# ---------------------------
# FastAPI App and Routes
# ---------------------------
app = FastAPI(title="Curra Blog")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://pmhfhd37-5500.uks1.devtunnels.ms",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection on startup"""
    await get_database()
    print("✅ Contact API connected to MongoDB")

@app.get("/contact/", status_code=status.HTTP_200_OK, response_model=list[ContactMessageResponse])
async def read_contact_messages():
    """Get all contact messages"""
    db = await get_database()
    contact_messages = []
    
    # Get the contact messages collection
    # You might want to create a dedicated collection for contact messages
    collection = db.get_collection("contact_messages")
    
    async for message in collection.find():
        # Convert MongoDB document to response model
        message["id"] = str(message["_id"])
        del message["_id"]  # Remove the ObjectId
        contact_messages.append(ContactMessageResponse(**message))
    
    return contact_messages

@app.post("/contact/", status_code=status.HTTP_201_CREATED, response_model=ContactMessageResponse)
async def create_contact_message(message: ContactMessageCreate):
    """Create a new contact message"""
    db = await get_database()
    
    # Get or create contact messages collection
    collection = db.get_collection("contact_messages")
    
    # Convert Pydantic model to dict
    message_dict = message.model_dump()
    message_dict["created_at"] = datetime.utcnow()
    
    # Insert into MongoDB
    result = await collection.insert_one(message_dict)
    
    # Retrieve the inserted document
    inserted_message = await collection.find_one({"_id": result.inserted_id})
    
    # Format the response
    inserted_message["id"] = str(inserted_message["_id"])
    del inserted_message["_id"]
    
    return ContactMessageResponse(**inserted_message)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        db = await get_database()
        # Test database connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}