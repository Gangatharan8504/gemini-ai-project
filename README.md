# Gemini AI Chat Portfolio App

A modern AI chatbot built with Flask, Gemini API, HTML, CSS, and JavaScript.

## Features

- ChatGPT-style UI
- Dark mode
- Chat history using localStorage
- Typing animation
- Markdown and code formatting
- Voice input
- Speech output
- Simple username login
- Render deployment ready

## Local Setup

```bash
pip install -r requirements.txt
```

Create `.env`:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=models/gemini-2.5-flash
SECRET_KEY=your_secret_key
```

Run:

```bash
python app.py
```

Open:

```txt
http://127.0.0.1:5000
```

## Render Deployment

Build Command:

```bash
pip install -r requirements.txt
```

Start Command:

```bash
gunicorn app:app
```

Add Environment Variables in Render:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=models/gemini-2.5-flash
SECRET_KEY=any_random_secret
```

Do not upload `.env` to GitHub.
