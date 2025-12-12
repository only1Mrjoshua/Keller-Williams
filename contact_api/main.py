from datetime import date, datetime
import os
import shutil
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel, EmailStr, ConfigDict, Field
from bson import ObjectId

# Import your existing database setup
from database import get_database

# ---------------------------
# Original Contact Messages Models (for main API)
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
    created_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={ObjectId: str}
    )

# ---------------------------
# Agent Contact Messages Models (for agent/form submissions)
# ---------------------------
class AgentContactMessageBase(BaseModel):
    name: str = Field(..., description="Sender's full name")
    email: EmailStr = Field(..., description="Sender's email address")
    phone: Optional[str] = Field(None, description="Sender's phone number (optional)")
    message: str = Field(..., description="The message content")

class AgentContactMessageCreate(AgentContactMessageBase):
    pass

class AgentContactMessageResponse(AgentContactMessageBase):
    id: str
    created_at: datetime
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
        "http://localhost:8000",
        "https://kwelitehomes.com",
        "https://keller-williams.onrender.com",
        "https://keller-williams-backend.onrender.com",
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
    collection = db.get_collection("contact_messages")
    
    async for message in collection.find().sort("created_at", -1):  # Sort by newest first
        # Convert MongoDB document to response model
        message["id"] = str(message["_id"])
        del message["_id"]  # Remove the ObjectId
        contact_messages.append(ContactMessageResponse(**message))
    
    return contact_messages

@app.post("/contact/", status_code=status.HTTP_201_CREATED, response_model=ContactMessageResponse)
async def create_contact_message(message: ContactMessageCreate):
    """Create a new contact message via main API"""
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

# NEW: Agent endpoint to create contact message from form data
@app.post("/agent/contact/", status_code=status.HTTP_201_CREATED, response_model=AgentContactMessageResponse)
async def agent_create_contact_message(
    name: str = Form(..., description="Sender's name"),
    email: EmailStr = Form(..., description="Sender's email address"),
    phone: Optional[str] = Form(None, description="Sender's phone number (optional)"),
    message: str = Form(..., description="The message content")
):
    """
    Agent endpoint to create a contact message from form submission.
    
    This endpoint is designed to be called from the contact form shown in the image.
    It accepts form-encoded data with the following fields:
    - name (required): Sender's full name
    - email (required): Sender's email address
    - phone (optional): Sender's phone number
    - message (required): The message content
    """
    db = await get_database()
    
    # Get or create contact messages collection
    collection = db.get_collection("contact_messages")
    
    # Prepare the message document for agent
    # Add a default subject for agent submissions
    message_dict = {
        "name": name,
        "email": email,
        "phone": phone,
        "subject": f"Form Submission from {name}",  # Default subject for agent submissions
        "message": message,
        "created_at": datetime.utcnow(),
        "source": "agent_form"  # Add source tracking
    }
    
    # Insert into MongoDB
    result = await collection.insert_one(message_dict)
    
    # Retrieve the inserted document
    inserted_message = await collection.find_one({"_id": result.inserted_id})
    
    # Format the response for agent (without subject)
    agent_response = {
        "id": str(inserted_message["_id"]),
        "name": inserted_message["name"],
        "email": inserted_message["email"],
        "phone": inserted_message.get("phone"),
        "message": inserted_message["message"],
        "created_at": inserted_message["created_at"]
    }
    
    return AgentContactMessageResponse(**agent_response)

# Alternative: Accept JSON body for agent
@app.post("/agent/contact/json", status_code=status.HTTP_201_CREATED, response_model=AgentContactMessageResponse)
async def agent_create_contact_message_json(message: AgentContactMessageCreate):
    """
    Alternative agent endpoint that accepts JSON body instead of form data.
    """
    db = await get_database()
    
    # Get or create contact messages collection
    collection = db.get_collection("contact_messages")
    
    # Convert Pydantic model to dict
    message_dict = message.model_dump()
    message_dict["subject"] = f"Form Submission from {message.name}"  # Default subject
    message_dict["created_at"] = datetime.utcnow()
    message_dict["source"] = "agent_json"
    
    # Insert into MongoDB
    result = await collection.insert_one(message_dict)
    
    # Retrieve the inserted document
    inserted_message = await collection.find_one({"_id": result.inserted_id})
    
    # Format the response for agent
    agent_response = {
        "id": str(inserted_message["_id"]),
        "name": inserted_message["name"],
        "email": inserted_message["email"],
        "phone": inserted_message.get("phone"),
        "message": inserted_message["message"],
        "created_at": inserted_message["created_at"]
    }
    
    return AgentContactMessageResponse(**agent_response)

# NEW: Get agent-specific messages
@app.get("/agent/contact/", status_code=status.HTTP_200_OK, response_model=list[AgentContactMessageResponse])
async def read_agent_contact_messages():
    """Get all contact messages submitted via agent endpoints"""
    db = await get_database()
    
    collection = db.get_collection("contact_messages")
    
    # Filter for agent submissions
    query = {"source": {"$in": ["agent_form", "agent_json"]}}
    
    agent_messages = []
    async for message in collection.find(query).sort("created_at", -1):
        # Format for agent response (without subject)
        agent_response = {
            "id": str(message["_id"]),
            "name": message["name"],
            "email": message["email"],
            "phone": message.get("phone"),
            "message": message["message"],
            "created_at": message["created_at"]
        }
        agent_messages.append(AgentContactMessageResponse(**agent_response))
    
    return agent_messages

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