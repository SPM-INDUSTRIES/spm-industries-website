"""Flask API for the SPM Industries Gemini chatbot."""

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai


# Load environment variables from backend/.env
load_dotenv(Path(__file__).with_name(".env"), override=True)


app = Flask(__name__)

# Allow frontend website to communicate with backend
CORS(app)


# Get Gemini settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Gemini model
GEMINI_MODEL = "gemini-2.5-flash"


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
            "reply": "Gemini API key is missing. Please add it to backend/.env"
        }), 503


    # Get user message
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "reply": "Invalid request."
        }), 400


    message = data.get("message", "").strip()


    if not message:
        return jsonify({
            "reply": "Please enter a message."
        }), 400


    if len(message) > 4000:
        return jsonify({
            "reply": "Please keep your message under 4000 characters."
        }), 400


    try:

        # Connect to Gemini
        client = genai.Client(
            api_key=GEMINI_API_KEY
        )


        # Send request to Gemini
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=f"""
You are the official AI assistant for SPM Industries in Batticaloa, Sri Lanka.

Rules:
- Give professional and friendly answers.
- Help visitors understand SPM Industries.
- Keep answers concise.
- If you don't know something, ask the visitor to contact info@spm.industries.

Visitor message:
{message}
"""
        )


        answer = response.text.strip()


        return jsonify({
            "reply": answer
        })


    except Exception as e:

        # Show real error in terminal for debugging
        print("GEMINI ERROR:", e)

        return jsonify({
            "reply": "The AI service is temporarily unavailable. Please try again shortly."
        }), 502



if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000
    )