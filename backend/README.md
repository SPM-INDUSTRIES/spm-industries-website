# SPM and Mevaa backend

This Flask app keeps the existing SPM chatbot API and adds a Mevaa customer inquiry API backed by SQLite.

## Install (PowerShell in VS Code)

From the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `backend/.env`: replace `GEMINI_API_KEY` with your Google AI Studio API key and replace `INQUIRY_ADMIN_TOKEN` with a private, long value. Keep `.env` private and never put the Gemini key in HTML or JavaScript. The Mevaa chat uses `MEVAA_GEMINI_MODEL` (default `gemini-2.5-flash`); the existing SPM chatbot keeps its separate `GEMINI_MODEL` setting. If PowerShell blocks virtual environment activation, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in that terminal, then activate again.

## Start locally

In the backend terminal (with the virtual environment activated):

```powershell
python app.py
```

The API runs at `http://127.0.0.1:5000`. Open a second VS Code terminal in the project root and serve the existing site:

```powershell
python -m http.server 8000
```

Open `http://127.0.0.1:8000/business/mevaa-organic-farm/` and submit the inquiry form. The backend creates `backend/inquiries.db` automatically the first time it saves a submission.

## Inquiries

- `POST /api/inquiries` accepts JSON fields `name`, `phone`, `email`, and `message`; it validates them and returns a success or error message.
- `GET /api/inquiries` returns saved inquiries and requires the `X-Admin-Token` header to match `INQUIRY_ADMIN_TOKEN` in `.env`.
- `POST /api/chat` accepts `{"message":"..."}` and returns a Mevaa-specific Gemini answer. It requires `GEMINI_API_KEY`.
- To print submissions in the terminal, from the `backend` directory run `python view_inquiries.py`.
- SQLite stores each inquiry in the `inquiries` table in `backend/inquiries.db`. Keep this file backed up; it contains customer contact details.

The inquiry form and chat widget currently point at the local API. For a deployed site, update their API URLs to the HTTPS address where this Flask API is hosted and set `CORS_ORIGINS` to your website's origin.

## Existing chatbot

The original `POST /chat` and `GET /health` routes remain available. Set `GEMINI_API_KEY` in `.env` to enable chat responses.
