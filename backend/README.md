# SPM and Mevaa backend

This Flask app preserves the existing SPM chatbot (`/chat`) and adds contact inquiry handling for Mevaa Organic Farm. Inquiry records are stored in a local SQLite database.

## Install in VS Code (PowerShell)

From the project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

`backend/.env` already exists in this project. Keep your existing Gemini API key and add a private `INQUIRY_ADMIN_TOKEN` value to it, for example:

```text
INQUIRY_ADMIN_TOKEN=replace_with_a_long_private_value
```

If you do not have a `.env` file, create one by copying `.env.example`, then set both values. Never add secret keys to website HTML or JavaScript.

## Start the backend and website

In the backend terminal:

```powershell
python app.py
```

In a second terminal, from the project root:

```powershell
python -m http.server 8000
```

Open `http://127.0.0.1:8000/business/mevaa-organic-farm/` and use the inquiry form in the Visit section. The form sends `name`, `phone`, `email`, and `message` as JSON to `POST http://127.0.0.1:5000/api/inquiries`. The backend validates the fields and returns a success message or a useful error.

## View submitted inquiries

From the `backend` directory, with the virtual environment active:

```powershell
python view_inquiries.py
```

The records are saved in `backend/inquiries.db`. The `GET /api/inquiries` endpoint is also available with the `X-Admin-Token` header set to the value of `INQUIRY_ADMIN_TOKEN` in `.env`.

## New files

- `database.py` creates the SQLite table and saves/loads inquiries.
- `view_inquiries.py` prints saved submissions in the terminal.
- `.env.example` documents the required private settings.

The existing `requirements.txt` already has Flask, Flask-CORS, `google-genai`, and `python-dotenv`. For deployment, host the Flask API over HTTPS, update the form's `data-api-url` in the Mevaa page, and set `CORS_ORIGINS` to your website origin.
