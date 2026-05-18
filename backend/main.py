from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load your API key from .env file
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Create the FastAPI app
app = FastAPI()

# Allow the React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # We'll tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This defines the shape of data we expect from the frontend
class Message(BaseModel):
    role: str       # "user" or "model"
    content: str    # the message text

class ChatRequest(BaseModel):
    messages: List[Message]   # full conversation history
    user_message: str         # latest message from user

# The /chat endpoint — this is what the frontend calls
@app.post("/chat")
async def chat(request: ChatRequest):
    # Set up Gemini model
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        system_instruction="You are a helpful, friendly, and concise AI assistant. Keep responses clear and conversational."
    )

    # Convert history into the format Gemini expects
    history = []
    for msg in request.messages:
        history.append({
            "role": msg.role,
            "parts": [msg.content]
        })

    # Start a chat session with memory (history)
    chat_session = model.start_chat(history=history)

    # Send the new user message and get a response
    response = chat_session.send_message(request.user_message)

    return {"reply": response.text}

# Health check — useful for deployment
@app.get("/")
async def root():
    return {"status": "Chatbot backend is running!"}