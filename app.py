import os
from flask import Flask, render_template, request, jsonify
from google.cloud import vision
import requests

app = Flask(__name__)

 
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "vision-key.json"
vision_client = vision.ImageAnnotatorClient()

 
GEMINI_API_KEY = "AIzaSyDjbfocem2gaHUX86yqnAWRRUOwtWgqVvo"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"

def get_gemini_response(prompt):
     
    formatted_prompt = (
        f"{prompt} Format the response with bold headings and use bullet points (`•`) for listing items. "
        "Do not use asterisks (`*`). Format the response in clear sections with proper markdown."
    )
    payload = {"contents": [{"parts": [{"text": formatted_prompt}]}]}
    response = requests.post(GEMINI_API_URL, json=payload)
    response_data = response.json()

    if "error" in response_data:
        return f"❌ API Error: {response_data['error']['message']}"

    candidates = response_data.get("candidates", [{}])
    return candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "No response available.").replace("\n", "<br>")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze_crop", methods=["POST"])
def analyze_crop():
     
    if "image" not in request.files:
        return jsonify({"status": "error", "message": "No image uploaded"}), 400

    image = request.files["image"]

    try:
        content = image.read()
        image = vision.Image(content=content)
        response = vision_client.label_detection(image=image)
        labels = [label.description for label in response.label_annotations]

        if not labels:
            return jsonify({"status": "error", "message": "No plant-related diseases detected."})

        disease_names = ", ".join(labels)
        disease_info = get_gemini_response(f"Explain these plant diseases: {disease_names}. Provide symptoms, causes, and solutions.")

        return jsonify({"status": "success", "detected_diseases": labels, "disease_description": disease_info})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/chatbot", methods=["POST"])
def chatbot():
    
    data = request.json
    user_question = data.get("question", "").strip()

    if not user_question:
        return jsonify({"status": "error", "message": "No question provided"}), 400

    response_text = get_gemini_response(user_question)
    return jsonify({"status": "success", "response": response_text})

@app.route("/market_prices", methods=["POST"])
def market_prices():
     
    data = request.json
    crop = data.get("crop", "").strip()
    region = data.get("region", "").strip()

    if not crop or not region:
        return jsonify({"status": "error", "message": "Please select both crop type and region."}), 400

    response_text = get_gemini_response(f"Provide the latest estimated market prices for {crop} in {region}.")
    return jsonify({"status": "success", "prices": response_text})

@app.route("/farming_tips", methods=["POST"])  
def farming_tips():
     
    data = request.json
    crop = data.get("crop", "").strip()  

    if not crop:
        return jsonify({"status": "error", "message": "Please enter a crop name."}), 400

    response_text = get_gemini_response(f"Provide five farming tips for growing {crop}.")
    return jsonify({"status": "success", "tips": response_text})


@app.route("/plan", methods=["POST"])
def generate_farming_plan():
     
    data = request.json
    city = data.get("city", "").strip()
    budget = data.get("budget", "").strip()

    if not city or not budget:
        return jsonify({"status": "error", "message": "Please provide both city and budget."}), 400

    response_text = get_gemini_response(
        f"I am a farmer in {city} with a budget of {budget}. Suggest the best crops to grow and provide detailed farming methods."
    )
    return jsonify({"status": "success", "city": city, "plan": response_text})

if __name__ == "__main__":
    app.run(debug=True)
