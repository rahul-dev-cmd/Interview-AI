import os
import json
import httpx
import traceback
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="InterviewAI Backend", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = os.getenv("MODEL", "google/gemini-2.0-flash-001")

print(f"🔑 API Key loaded: {'Yes (' + OPENROUTER_API_KEY[:12] + '...)' if OPENROUTER_API_KEY else 'NO - Set it in .env!'}")
print(f"🤖 Model: {DEFAULT_MODEL}")



class ChatMessage(BaseModel):
    role: str
    content: str


class InterviewConfig(BaseModel):
    domain: str = "frontend"
    level: str = "fresher"
    totalQuestions: int = 5


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    interview_config: Optional[InterviewConfig] = None
    model: Optional[str] = None


class ReportRequest(BaseModel):
    messages: List[ChatMessage]
    config: Optional[InterviewConfig] = None



async def call_openrouter(messages: List[Dict[str, str]], model: str = DEFAULT_MODEL) -> str:
    """Call OpenRouter API and return the response content."""
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not set in .env file")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "InterviewAI",
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048,
    }

    print(f"\n📤 Sending request to OpenRouter...")
    print(f"   Model: {model}")
    print(f"   Messages count: {len(messages)}")
    print(f"   First message role: {messages[0]['role'] if messages else 'none'}")

    async with httpx.AsyncClient(timeout=90.0) as client:
        try:
            response = await client.post(OPENROUTER_URL, json=payload, headers=headers)
            
            print(f"📥 Response status: {response.status_code}")
            
            if response.status_code != 200:
                error_text = response.text
                print(f"❌ OpenRouter Error: {error_text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"OpenRouter API error: {error_text}",
                )
            
            data = response.json()
            
            if "choices" not in data or len(data["choices"]) == 0:
                print(f"❌ Unexpected response format: {json.dumps(data, indent=2)}")
                raise HTTPException(status_code=502, detail=f"Unexpected response: {json.dumps(data)}")
            
            content = data["choices"][0]["message"]["content"]
            print(f"✅ Got response ({len(content)} chars)")
            return content

        except httpx.TimeoutException:
            print("❌ Request timed out!")
            raise HTTPException(status_code=504, detail="Request to OpenRouter timed out")
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            traceback.print_exc()
            raise HTTPException(status_code=502, detail=f"Error calling OpenRouter: {str(e)}")



@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "InterviewAI Backend",
        "version": "1.0.0",
        "api_key_set": bool(OPENROUTER_API_KEY),
        "model": DEFAULT_MODEL,
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "api_key_set": bool(OPENROUTER_API_KEY)}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Proxy chat messages to OpenRouter for the interview."""
    print(f"\n{'='*50}")
    print(f"📨 /api/chat called with {len(request.messages)} messages")
    
    messages = [{"role": m.role, "content": m.content} for m in request.messages]
    model = request.model or DEFAULT_MODEL
    
    content = await call_openrouter(messages, model)
    return {"content": content, "model": model}


@app.post("/api/report")
async def generate_report(request: ReportRequest):
    """Generate a structured performance report from the interview conversation."""
    print(f"\n{'='*50}")
    print(f"📊 /api/report called")

    # Build the conversation for the report prompt
    conversation_text = ""
    for msg in request.messages:
        if msg.role == "system":
            continue
        label = "Interviewer" if msg.role == "assistant" else "Candidate"
        conversation_text += f"\n{label}: {msg.content}\n"

    config = request.config or InterviewConfig()

    report_prompt = f"""You are an expert interview performance analyst. Analyze the following technical interview conversation and generate a detailed performance report.

Interview Details:
- Domain: {config.domain}
- Level: {config.level}
- Total Questions: {config.totalQuestions}

Conversation:
{conversation_text}

Generate a JSON report with EXACTLY this structure (no extra text, no markdown code blocks, ONLY valid JSON):
{{
  "overall_score": <number 0-10 with one decimal>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>", "<strength 4>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>", "<recommendation 4>"],
  "question_feedback": [
    {{
      "question": "<brief question description>",
      "score": <number 0-10 with one decimal>,
      "feedback": "<specific feedback for this question>"
    }}
  ]
}}

IMPORTANT: Return ONLY valid JSON. No explanations, no markdown, just JSON."""

    messages = [{"role": "user", "content": report_prompt}]
    content = await call_openrouter(messages, DEFAULT_MODEL)

    
    try:
        content = content.strip()
        # Remove markdown code blocks if present
        if content.startswith("```"):
            lines = content.split("\n")
            content = "\n".join(lines[1:])
            if content.endswith("```"):
                content = content[:-3]
            content = content.strip()

        report = json.loads(content)
        return report
    except json.JSONDecodeError:
        return {
            "overall_score": 7.0,
            "summary": "The interview has been completed. Report parsing had an issue.",
            "strengths": ["Completed the full interview", "Showed engagement with questions"],
            "weaknesses": ["Report parsing issue — try again for detailed analysis"],
            "recommendations": ["Consider retrying for a more detailed report"],
            "question_feedback": [],
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
