"""Flask API for the SPM Industries Gemini chatbot."""

import os
import hmac
import re
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
from google.genai import types

# Import SPM website search
from spm_search import get_spm_information


# Load environment variables from backend/.env
load_dotenv(Path(__file__).with_name(".env"), override=True)

from database import create_inquiry, get_inquiries


app = Flask(__name__)

# Allow local frontend use; configure CORS_ORIGINS for the deployed site.
allowed_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "*").split(",")
    if origin.strip()
]
CORS(app, resources={r"/*": {"origins": allowed_origins}})


@app.post("/api/inquiries")
def submit_inquiry():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Please send a valid form submission."}), 400

    fields = ("name", "phone", "email", "message")
    if any(not isinstance(data.get(field), str) for field in fields):
        return jsonify({"error": "Please complete all inquiry fields."}), 400

    name = data["name"].strip()
    phone = data["phone"].strip()
    email = data["email"].strip().lower()
    message = data["message"].strip()

    if not name or len(name) > 100:
        return jsonify({"error": "Enter your name (up to 100 characters)."}), 400
    if (
        len(phone) > 30
        or sum(character.isdigit() for character in phone) < 7
        or not re.fullmatch(r"[+()\d\s.-]+", phone)
    ):
        return jsonify({"error": "Enter a valid phone number."}), 400
    if (
        len(email) > 254
        or not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email)
    ):
        return jsonify({"error": "Enter a valid email address."}), 400
    if not message or len(message) > 3000:
        return jsonify({"error": "Enter a message (up to 3000 characters)."}), 400

    try:
        create_inquiry(name, phone, email, message)
    except Exception:
        app.logger.exception("Could not save customer inquiry")
        return jsonify({"error": "We could not save your inquiry. Please try again."}), 500

    return jsonify({"message": "Thank you! Your inquiry has been sent."}), 201


@app.get("/api/inquiries")
def list_inquiries():
    admin_token = os.getenv("INQUIRY_ADMIN_TOKEN", "")
    supplied_token = request.headers.get("X-Admin-Token", "")
    if not admin_token:
        return jsonify({"error": "Inquiry viewing is not configured."}), 503
    if not hmac.compare_digest(supplied_token, admin_token):
        return jsonify({"error": "Unauthorized."}), 401

    try:
        return jsonify({"inquiries": get_inquiries()})
    except Exception:
        app.logger.exception("Could not load customer inquiries")
        return jsonify({"error": "Could not load inquiries."}), 500


# Get Gemini settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.6-flash"
)


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "gemini_configured": bool(GEMINI_API_KEY)
    })


@app.post("/chat")
def chat():

    # Check API key
    if not GEMINI_API_KEY:
        return jsonify({
            "error": "Gemini API key is missing. Please add it to backend/.env"
        }), 503


    # Get user message
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid request."
        }), 400


    message = data.get("message", "").strip()


    if not message:
        return jsonify({
            "error": "Please enter a message."
        }), 400


    if len(message) > 4000:
        return jsonify({
            "error": "Please keep your message under 4000 characters."
        }), 400


    try:

        # Connect to Gemini
        client = genai.Client(
            api_key=GEMINI_API_KEY
        )


        # Search SPM websites
        print("Searching SPM websites...")

        website_context = get_spm_information()


        print("Website information loaded.")


        # System instructions
        system_instruction = """
You are the official AI assistant for SPM Industries.

You answer questions about:
- SPM Academy
- SPM Tech
- SPM Industries services and information


Rules:
- Use only the provided SPM website information.
- Give professional and friendly answers.
- Keep answers concise.
- Do not create false information.
- If the information is not available, say:
"I could not find that information on the SPM website."
"""


        # Send request to Gemini
        response = client.models.generate_content(
            model=GEMINI_MODEL,

            contents=f"""
SPM Website Information:

{website_context}


Customer Question:

{message}
""",

            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            )
        )


        answer = (
            response.text
            or "I could not generate a response. Please try again."
        ).strip()


        return jsonify({
            "response": answer
        })


    except Exception as e:

        print("GEMINI ERROR:", e)

        return jsonify({
            "error": "The AI service is temporarily unavailable. Please try again shortly."
        }), 502



if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
