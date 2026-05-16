from flask import Flask, render_template, request, jsonify, session
from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key-change-this")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("WARNING: GEMINI_API_KEY is missing. Add it in .env locally or Render Environment Variables.")

client = genai.Client(api_key=api_key)

MODEL_NAME = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()

    if not username:
        return jsonify({"success": False, "message": "Username is required"}), 400

    session["username"] = username
    return jsonify({"success": True, "username": username})


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("username", None)
    return jsonify({"success": True})


@app.route("/me")
def me():
    return jsonify({
        "logged_in": "username" in session,
        "username": session.get("username")
    })


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "").strip()

        if not user_message:
            return jsonify({"reply": "Please type a message."}), 400

        username = session.get("username", "Guest")

        prompt = f"""
You are a helpful AI assistant inside Gangatharan's portfolio chatbot.
User name: {username}

User message:
{user_message}
"""

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        return jsonify({"reply": response.text})

    except Exception as e:
        error_msg = str(e)

        if "429" in error_msg or "quota" in error_msg.lower():
            return jsonify({
                "reply": "Gemini quota limit reached. Please wait and try again later, or enable billing in Google AI Studio."
            }), 429

        if "API_KEY" in error_msg or "api key" in error_msg.lower():
            return jsonify({
                "reply": "API key error. Please check your GEMINI_API_KEY."
            }), 500

        return jsonify({"reply": "Error: " + error_msg}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
