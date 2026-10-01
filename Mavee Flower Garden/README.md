# Mavee Flower Garden chat backend

## Setup

Open a terminal in this folder and install the Python packages:

```powershell
pip install -r requirements.txt
```

Put your Google Gemini API key in `.env`:

```text
GEMINI_API_KEY=your_real_api_key
```

Keep `.env` private; it is excluded from Git.

## Run

```powershell
python app.py
```

The website and API run together at `http://127.0.0.1:5000`. Open that address for the site. The chat sends a JSON `POST` request to `/api/chat` with a `message` field; successful responses have the form `{"reply":"..."}`. The assistant uses visible text from this folder's `index.html` as website context.
