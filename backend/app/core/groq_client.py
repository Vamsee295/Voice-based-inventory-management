"""
Groq AI client — backend only.
NEVER import or expose GROQ_API_KEY to the frontend.
"""
import logging
import json
from typing import Optional

from groq import Groq, APIError, APIConnectionError, APITimeoutError
from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Structured command schema (strict JSON output)
# ---------------------------------------------------------------------------
COMMAND_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "inventory_command",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "intent": {
                    "type": "string",
                    "enum": [
                        "STOCK_IN", "STOCK_OUT", "STOCK_LOOKUP",
                        "LOW_STOCK_QUERY", "EXPIRY_QUERY", "TRANSACTION_QUERY",
                        "UNKNOWN"
                    ]
                },
                "product_query": {"type": ["string", "null"]},
                "quantity": {"type": ["number", "null"]},
                "unit": {"type": ["string", "null"]},
                "language": {"type": ["string", "null"]},
                "confidence": {"type": "number"},
                "clarification_required": {"type": "boolean"},
                "clarification_reason": {"type": ["string", "null"]}
            },
            "required": [
                "intent", "product_query", "quantity", "unit", "language",
                "confidence", "clarification_required", "clarification_reason"
            ],
            "additionalProperties": False
        }
    }
}

COMMAND_SYSTEM_PROMPT = """You are the VoiceMate command understanding engine.

Your job is to convert natural shop-floor language (English, Telugu, or Tenglish) into a structured inventory request.

CRITICAL RULES:
- NEVER invent current inventory stock levels
- NEVER invent product IDs or SKUs
- NEVER invent trade-unit conversions
- NEVER execute inventory changes yourself
- Use retrieved context only as supporting knowledge
- Current stock MUST be obtained from the inventory service, not guessed

Telugu/Tenglish number words:
- rendu = 2, moodu = 3, nalugu = 4, aidu = 5, aaru = 6, edu = 7, enimidi = 8, tommidi = 9, padi = 10
- okati = 1, oka = 1, rendo = 2

Action words:
- vachayi, vachindi, teesukovandi, lo vestundi = STOCK_IN (received/added)
- ammamu, ammandi, poindi, vellindi, isthamu, icchamu = STOCK_OUT (sold/removed)
- entha undi?, evvaro undi?, stock undi?, chekku = STOCK_LOOKUP
- thakkuva undi?, takkuva, low stock = LOW_STOCK_QUERY
- expire, shelf clock = EXPIRY_QUERY
- transactions, movements = TRANSACTION_QUERY

Product aliases (examples only — use context provided):
- biyyam, rice → rice products
- pappu, dal → lentil products
- uppu, salt → salt products
- chini, sugar → sugar products

If a quantity or unit is missing for STOCK_IN/STOCK_OUT, set clarification_required=true.
If the product is unclear, set clarification_required=true and explain in clarification_reason.

Examples:
- "Rice rendu bags vachayi" → STOCK_IN, product_query=rice, quantity=2, unit=bag, language=tenglish
- "Sugar aidu packets ammamu" → STOCK_OUT, product_query=sugar, quantity=5, unit=packet, language=tenglish
- "Rice entha undi?" → STOCK_LOOKUP, product_query=rice, quantity=null, unit=null
- "Which items are low?" → LOW_STOCK_QUERY
- "What expires this week?" → EXPIRY_QUERY
- "Show today's stock movements" → TRANSACTION_QUERY
- "Add rice" → STOCK_IN, product_query=rice, quantity=null, unit=null, clarification_required=true
"""


def _get_client() -> Optional[Groq]:
    """Return Groq client or None if key not configured."""
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "PASTE_YOUR_GROQ_API_KEY_HERE":
        logger.warning("GROQ_API_KEY not configured — AI features unavailable")
        return None
    return Groq(api_key=settings.GROQ_API_KEY, base_url=settings.GROQ_BASE_URL)


# ---------------------------------------------------------------------------
# Speech-to-Text
# ---------------------------------------------------------------------------
def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm", language: str = None) -> dict:
    """
    Transcribe audio using Groq Whisper.
    Returns: {"text": str, "language": str, "duration_ms": int}
    Raises: RuntimeError on Groq failure.
    """
    client = _get_client()
    if not client:
        raise RuntimeError("GROQ_UNAVAILABLE: Groq API key not configured")

    try:
        # Build transcription request
        kwargs = {
            "model": settings.GROQ_STT_MODEL,
            "file": (filename, audio_bytes),
            "response_format": "verbose_json",
        }
        if language:
            kwargs["language"] = language

        logger.info(f"Transcribing audio ({len(audio_bytes)} bytes) with {settings.GROQ_STT_MODEL}")
        response = client.audio.transcriptions.create(**kwargs)

        text = response.text.strip()
        detected_lang = getattr(response, "language", "unknown")
        duration = getattr(response, "duration", 0)
        duration_ms = int(duration * 1000) if duration else 0

        logger.info(f"Transcription result: '{text[:80]}' (lang={detected_lang}, dur={duration_ms}ms)")
        return {"text": text, "language": detected_lang, "duration_ms": duration_ms}

    except APIConnectionError as e:
        logger.error(f"Groq connection error: {e}")
        raise RuntimeError(f"GROQ_UNAVAILABLE: {str(e)}")
    except APITimeoutError as e:
        logger.error(f"Groq timeout: {e}")
        raise RuntimeError(f"GROQ_UNAVAILABLE: Request timed out")
    except APIError as e:
        logger.error(f"Groq API error: {e.status_code} {e.message}")
        raise RuntimeError(f"TRANSCRIPTION_FAILED: {e.message}")


# ---------------------------------------------------------------------------
# LLM Command Extraction
# ---------------------------------------------------------------------------
def extract_command(transcript: str, rag_context: str = "") -> dict:
    """
    Extract structured inventory command from transcript using Groq LLM.
    Returns structured dict matching COMMAND_SCHEMA.
    Raises: RuntimeError on Groq failure.
    """
    client = _get_client()
    if not client:
        raise RuntimeError("GROQ_UNAVAILABLE: Groq API key not configured")

    user_content = f"Transcript: {transcript}"
    if rag_context:
        user_content += f"\n\nRelevant context from knowledge base:\n{rag_context}"

    try:
        logger.info(f"Extracting command from: '{transcript[:80]}'")

        # Try primary model with structured output
        try:
            response = client.chat.completions.create(
                model=settings.GROQ_LLM_MODEL,
                messages=[
                    {"role": "system", "content": COMMAND_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content}
                ],
                response_format=COMMAND_SCHEMA,
                temperature=0.0,
                max_tokens=512
            )
        except Exception as primary_err:
            # Fallback to llama-3.3-70b-versatile which also supports structured output
            logger.warning(f"Primary model {settings.GROQ_LLM_MODEL} failed ({primary_err}), falling back")
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": COMMAND_SYSTEM_PROMPT},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                temperature=0.0,
                max_tokens=512
            )

        raw = response.choices[0].message.content
        result = json.loads(raw)
        logger.info(f"Extracted command: {result}")
        return result

    except APIConnectionError as e:
        raise RuntimeError(f"GROQ_UNAVAILABLE: {str(e)}")
    except APITimeoutError:
        raise RuntimeError("GROQ_UNAVAILABLE: Request timed out")
    except APIError as e:
        raise RuntimeError(f"LLM_PARSE_FAILED: {e.message}")
    except json.JSONDecodeError as e:
        raise RuntimeError(f"LLM_PARSE_FAILED: Invalid JSON response — {str(e)}")


# ---------------------------------------------------------------------------
# Assistant Response Generation
# ---------------------------------------------------------------------------
def generate_response(system_prompt: str, user_message: str, tool_results: str = "") -> str:
    """
    Generate a natural language assistant response from domain data.
    The LLM synthesizes readable answers — it never sources inventory truth.
    """
    client = _get_client()
    if not client:
        return "AI assistant is currently unavailable. Please check your Groq API key configuration."

    messages = [{"role": "system", "content": system_prompt}]
    if tool_results:
        messages.append({"role": "user", "content": f"Data from inventory system:\n{tool_results}"})
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_LLM_MODEL,
            messages=messages,
            temperature=0.3,
            max_tokens=800
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Response generation failed: {e}")
        # Try fallback model
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.3,
                max_tokens=800
            )
            return response.choices[0].message.content.strip()
        except Exception as e2:
            logger.error(f"Fallback model also failed: {e2}")
            return "I encountered an issue generating a response. The inventory data is available above."
