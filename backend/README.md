# Gemini chatbot backend

## Setup

From the project root in PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Copy `.env.example` to `.env`, then set `GEMINI_API_KEY` in `.env` to your real Gemini API key. Do not put this key in `index.html`, JavaScript, or any file committed to Git.

## Run

```powershell
python app.py
```

The API listens at `http://127.0.0.1:5000/chat`. The health check is at
`http://127.0.0.1:5000/health`.

In a second terminal, serve the frontend from the project root:

```powershell
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/` in your browser.
