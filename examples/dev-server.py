"""
Simple FastAPI development server for testing SSE streaming
Simulates an AI chat API with Server-Sent Events using Data Stream v1 format
"""

import json
import time
import asyncio
from typing import List, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI()

# Configure CORS to allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Custom-Header"],
)


class MessagePart(BaseModel):
    type: str
    text: str | None = None
    state: str | None = None

    class Config:
        extra = "allow"  # Allow additional fields


class Message(BaseModel):
    id: str
    role: str
    parts: List[MessagePart]


class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "gpt-4o"
    webSearch: bool = False


def get_response(message: str) -> List[str]:
    """Generate response based on user message"""
    msg = (message or "").lower()

    if "hello" in msg or "hi" in msg:
        return split_into_tokens(
            "Hello! 👋 I'm GhostChat, your AI assistant. How can I help you today?"
        )

    if "help" in msg:
        return split_into_tokens(
            "I can help you with various tasks! Try asking me about:\n\n"
            "- **Code examples** - I can write code in multiple languages\n"
            "- **Explanations** - I can explain concepts clearly\n"
            "- **Problem solving** - I can help think through challenges\n"
            "- **General questions** - Ask me anything!\n\n"
            "What would you like to know?"
        )

    if "code" in msg or "example" in msg:
        return split_into_tokens(
            "Sure! Here's a simple example:\n\n"
            "```javascript\n"
            "function greet(name) {\n"
            "  return `Hello, ${name}!`;\n"
            "}\n\n"
            "console.log(greet('World'));\n"
            "```\n\n"
            "This function takes a name and returns a greeting. Would you like to see more examples?"
        )

    if "features" in msg or "what can you do" in msg:
        return split_into_tokens(
            "I'm powered by GhostChat Embed, which includes:\n\n"
            "✨ **Shadow DOM isolation** - No CSS conflicts\n"
            "🎨 **Tailwind + shadcn styling** - Beautiful, modern UI\n"
            "📡 **SSE streaming** - Real-time responses\n"
            "🌍 **i18n support** - Multiple languages & RTL\n"
            "♿ **Accessibility** - ARIA labels, keyboard navigation\n"
            "📱 **Responsive** - Works great on mobile\n\n"
            "Is there something specific you'd like to know?"
        )

    # Default response
    return split_into_tokens(
        f'I understand you\'re asking about "{message}". '
        "This is a demo server with simulated responses. "
        "In a real implementation, this would connect to an AI model like GPT-4, Claude, or an open-source LLM. "
        "\n\nTry asking me about 'help', 'code', or 'features' for specific examples!"
    )


def split_into_tokens(text: str) -> List[str]:
    """Split text into tokens for streaming"""
    import re
    # Split by words and punctuation
    tokens = re.split(r'(\s+|```[\s\S]*?```|[.,!?;:\n])', text)
    return [t for t in tokens if t]


async def stream_chat(request: ChatRequest):
    """Stream chat response using UI Message Stream format"""
    messages = request.messages
    if not messages:
        return

    last_message = messages[-1]

    text_part = next((p for p in last_message.parts if p.type == "text"), None)
    user_text = text_part.text if text_part else ""

    message_id = f"msg_{int(time.time() * 1000)}"
    tokens = get_response(user_text)

    # Start events
    yield f'data: {{"type":"start"}}\n\n'
    yield f'data: {{"type":"start-step"}}\n\n'

    # Text start with ID
    yield f'data: {{"type":"text-start","id":"{message_id}"}}\n\n'

    # Stream tokens as text-delta
    for delta in tokens:
        payload = {
            "type": "text-delta",
            "id": message_id,
            "delta": delta,
        }
        yield f"data: {json.dumps(payload)}\n\n"
        # await asyncio.sleep(0.015)  # Commented out - works without delay

    # End events
    yield f'data: {{"type":"text-end","id":"{message_id}"}}\n\n'
    yield f'data: {{"type":"finish-step"}}\n\n'
    yield f'data: {{"type":"finish"}}\n\n'
    yield f'data: [DONE]\n\n'


@app.post("/chat")
async def chat(request: ChatRequest):
    """SSE chat endpoint - simulates streaming AI responses"""

    return StreamingResponse(
        stream_chat(request),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    )


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": time.time()}


if __name__ == "__main__":
    import uvicorn
    print("\n✅ Dev API server running on http://localhost:3000")
    print("   Chat endpoint: http://localhost:3000/chat\n")
    uvicorn.run(app, host="0.0.0.0", port=3000)
