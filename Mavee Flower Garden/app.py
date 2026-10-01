"""Flask chat API for the Mavee Flower Garden website."""

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from google import genai
from google.genai import types

from spm_search import get_farm_information

load_dotenv(Path(__file__).with_name(".env"), override=True)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

SITE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=None)
CORS(app)


@app.get("/")
def home():
    return send_from_directory(SITE_DIR, "index.html")


@app.get("/<path:filename>")
def site_file(filename):
    """Serve only the website's public assets alongside the API."""
    first_part = Path(filename).parts[0] if Path(filename).parts else ""
    if first_part not in {"css", "js", "Images", "assets"}:
        return jsonify({"error": "Not found."}), 404

    site_asset = SITE_DIR / filename
    if site_asset.is_file():
        return send_from_directory(SITE_DIR, filename)

    # Shared icons live in the repository-level assets directory.
    if first_part == "assets":
        return send_from_directory(SITE_DIR.parent / "assets", Path(filename).relative_to("assets"))
    return jsonify({"error": "Not found."}), 404


@app.get("/health")
def health():
    return jsonify({"status": "ok", "gemini_configured": bool(GEMINI_API_KEY)})


@app.post("/api/chat")
def chat():
    if not GEMINI_API_KEY:
        return jsonify({"error": "Add your Gemini API key to the .env file."}), 503

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Send a JSON object containing a message."}), 400

    message = data.get("message")
    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "Please enter a message."}), 400
    message = message.strip()
    if len(message) > 2000:
        return jsonify({"error": "Keep your message under 2000 characters."}), 400

    try:
        # Initialize client with API Key
        client = genai.Client(api_key=GEMINI_API_KEY)

        # Build dynamic system instruction with website context
        system_instruction = (
            "You are a friendly assistant for Mavee Flower Garden in Batticaloa. "
            "Answer using the website information below. Be concise and do not "
            "invent details that are not on the site.\n\n"
            f"Website information:\n{get_farm_information()}"
        )

        # Generate response using gemini-2.5-flash or gemini-3.6-flash
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            ),
        )

        reply = (
            response.text or "I could not prepare a reply. Please try again."
        ).strip()
        return jsonify({"reply": reply})

    except Exception:
        app.logger.exception("Gemini chat request failed")
        return jsonify({"error": "The chat service is temporarily unavailable."}), 502


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
