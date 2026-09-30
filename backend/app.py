"""Flask API for the SPM Industries Gemini chatbot."""

import os
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


app = Flask(__name__)

# Allow frontend website to communicate with backend
CORS(app)


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