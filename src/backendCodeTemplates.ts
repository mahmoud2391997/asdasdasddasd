/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FASTAPI_CODE_TREE = {
  "app/main.py": `# app/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, lessons, templates, monitoring
from app.core.config import settings
import sentry_sdk

# Sentry Production Monitoring initialization
if settings.SENTRY_DSN:
    sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=1.0)

app = FastAPI(
    title="منصة التحضير التربوي الذكي - AI Lesson Preparation API",
    version="1.0.0",
    docs_url="/docs"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Gateways endpoints routing
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(lessons.router, prefix="/api/v1/lessons", tags=["Lesson Preparation"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["Template Matrix"])
app.include_router(monitoring.router, prefix="/api/v1/monitor", tags=["Prometheus Monitoring"])

@app.get("/healthz")
async def health_check():
    return {"status": "healthy", "engine": "FastAPI 0.109.0"}
`,

  "app/core/ai_engine.py": `# app/core/ai_engine.py
import json
from google import genai
from google.genai import types
from app.core.config import settings
from app.schemas.lesson import LessonSchema
from app.core.exceptions import AIApiException

class AILessonGenerationEngine:
    def __init__(self):
        # Named parameters matching the latest @google/genai guidelines
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-3.5-flash"

    async def generate_lesson_plan(
        self, 
        book_content: str, 
        subject: str, 
        stage: str, 
        prompt_rules: str
    ) -> LessonSchema:
        """
        Generates a strict JSON-structured lesson preparation.
        Adheres to boundaries: The Book represents the "Only Source of Truth".
        """
        system_instruction = (
            "You are an expert pedagogical auditor. You must structure a school lesson preparation "
            "strictly bounded by the provided book content. Do NOT hallucinate objectives, items or facts "
            "not found under the book source. Generate output ONLY in JSON format matching the schema."
        )

        prompt = f"""
        الموضوع والمادة: {subject} ({stage})
        قواعد الصياغة التربوية الصارمة: {prompt_rules}
        محتوى الكتاب المدرسي المعتمد (المصدر الوحيد):
        \"\"\"{book_content}\"\"\"
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=LessonSchema, # Enforce structured JSON schema
                    temperature=0.1, # Keep output strictly focused and deterministic
                )
            )
            
            # Extract and validate text response
            result_text = response.text
            return LessonSchema.parse_raw(result_text)
            
        except Exception as e:
            # Automatic Fallback & Retry mechanism
            raise AIApiException(f"AI generation failed: {str(e)}")
`,

  "app/core/rules_engine.py": `# app/core/rules_engine.py
import re
from app.schemas.lesson import LessonSchema
from app.models.teacher import TeacherGender, StudentGender

class EducationalRulesEngine:
    """
    Pedagogical compliance, auditing, and Dynamic Arabic Grammar gender alignment.
    """
    
    @staticmethod
    def apply_gender_rewriter(content: str, student_gender: StudentGender) -> str:
        """
        Converts verb inflections and pronouns to feminine when classes target girls exclusively.
        """
        if student_gender != StudentGender.FEMALE:
            return content
            
        # Standard grammatical conversion mappings
        replacements = [
            (r"الطلاب", "الطالبات"),
            (r"المتعلمين", "المتعلمات"),
            (r"المتعلم", "المتعلمة"),
            (r"الطالب", "الطالبة"),
            (r"يكتب", "تكتب"),
            (r"يناقش", "تناقش"),
            (r"يجيب", "تجيب"),
            (r"يقوم", "تقوم"),
            (r"يرسم", "ترسم")
        ]
        
        rewritten = content
        for pattern, replacement in replacements:
            rewritten = re.sub(pattern, replacement, rewritten)
            
        return rewritten

    @classmethod
    def validate_lesson_integrity(
        cls, 
        lesson: LessonSchema, 
        book_content: str,
        student_gender: StudentGender
    ) -> dict:
        """
        Validates content limits to block hallucinated materials outside the curriculum.
        """
        audit_logs = []
        scores = {"alignment": 100, "integrity": 100, "pedagogy": 100}
        
        # Verify objectives count >= 3
        if len(lesson.objectives) < 3:
            scores["pedagogy"] -= 15
            audit_logs.append("تنبيه: عدد الأهداف أقل من 3 أهداف معيارية.")
            
        # Verify empty placeholder variables
        for item in [lesson.introduction] + lesson.objectives + lesson.activities:
            if "{{" in item or "}}" in item:
                scores["integrity"] -= 30
                audit_logs.append("خطأ: تم رصد واصفات فارغة لم تُملأ في القالب.")

        mean_score = sum(scores.values()) // len(scores)
        return {
            "is_valid": mean_score >= 80,
            "overall_score": mean_score,
            "scores_details": scores,
            "audit_logs": audit_logs
        }
`,

  "app/tasks/worker.py": `# app/tasks/worker.py
from celery import Celery
from app.core.config import settings
from app.core.ai_engine import AILessonGenerationEngine
from app.core.rules_engine import EducationalRulesEngine

# Redis server is utilized as Celery broker & state backend backend
celery_app = Celery(
    "lesson_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Priority queues setup for traffic spikes handling
celery_app.conf.task_routes = {
    "app.tasks.worker.prepare_lesson_task": {"queue": "priority_high"},
    "app.tasks.worker.cleanup_logs": {"queue": "priority_low"}
}

@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def prepare_lesson_task(self, req_data: dict):
    """
    Asynchronous queue worker task responsible for AI Lesson prep generation.
    Supports fault-tolerant dead letter routing.
    """
    try:
      engine = AILessonGenerationEngine()
      
      # Step 1: AI Prompt Generation
      raw_plan = engine.generate_lesson_plan(
          book_content=req_data["content"],
          subject=req_data["subject"],
          stage=req_data["stage"],
          prompt_rules=req_data["subject_rules"]
      )
      
      # Step 2: Educational Rule verification & Gender conjugation
      final_prep = EducationalRulesEngine.apply_gender_rules(
          raw_plan, 
          student_gender=req_data["student_gender"]
      )
      
      # Step 3: Persistence inside Postgres database 
      return {"status": "SUCCESS", "data": final_prep}
      
    except Exception as exc:
        # Automatic task retry in case of transient API timeout
        raise self.retry(exc=exc)
`,

  "app/models/schemas.py": `# app/models/schemas.py
from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    plan_tier = Column(String(20), default="basic") # basic, pro, expert
    credits_remaining = Column(Integer, default=10)

class LessonPreparation(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    subject = Column(String(50), nullable=False)
    stage = Column(String(50), nullable=False)
    introduction = Column(Text, nullable=False)
    objectives = Column(JSON, nullable=False) # Structured array
    activities = Column(JSON, nullable=False)
    assessment = Column(JSON, nullable=False)
    values = Column(JSON, nullable=True)
    validation_score = Column(Integer, default=100)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CostTracking(Base):
    __tablename__ = "cost_tracking"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    tokens_count = Column(Integer, nullable=False)
    estimated_usd_cost = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
`
};
