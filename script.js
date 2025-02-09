document.addEventListener("DOMContentLoaded", function () {
    hideAllSections();  
});

function hideAllSections() {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });
}

function showSection(sectionId) {
    document.getElementById("intro").style.display = "none";  
    hideAllSections();
    document.getElementById(sectionId).style.display = "block";
}

 
let speechSynthesisInstance;

function speakText(elementId) {
    if ('speechSynthesis' in window) {
        let text = document.getElementById(elementId).innerText;
        if (text.trim() === "") {
            alert("No text available to read.");
            return;
        }
        stopSpeech();
        speechSynthesisInstance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(speechSynthesisInstance);
    } else {
        alert("Text-to-Speech is not supported in your browser.");
    }
}

function stopSpeech() {
    if (speechSynthesisInstance) {
        window.speechSynthesis.cancel();
    }
}

 
async function analyzeCrop() {
    const imageFile = document.getElementById("cropImage").files[0];
    if (!imageFile) {
        document.getElementById("cropResult").innerHTML = `<p class="error">Please select an image.</p>`;
        return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
        const response = await fetch("/analyze_crop", {
            method: "POST",
            body: formData,
        });

        const result = await response.json();
        if (result.status === "success") {
            document.getElementById("cropResult").innerHTML = `
                <h3><strong>🩺 Detected Diseases:</strong></h3>
                <p>${result.detected_diseases.join(", ")}</p>
                <h3><strong>📖 Description:</strong></h3>
                <p>${result.disease_description}</p>
            `;
        } else {
            document.getElementById("cropResult").innerHTML = `<p class="error">${result.message}</p>`;
        }
    } catch (error) {
        console.error("Request Failed:", error);
        document.getElementById("cropResult").innerHTML = `<p class="error">Request failed. Try again.</p>`;
    }
}

 
async function askChatbot() {
    const userQuestion = document.getElementById("userQuestion").value;
    if (!userQuestion) {
        document.getElementById("chatbotResponse").innerHTML = `<p class="error">Please enter a question.</p>`;
        return;
    }

    try {
        const response = await fetch("/chatbot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: userQuestion }),
        });

        const result = await response.json();
        document.getElementById("chatbotResponse").innerHTML = `
            <h3><strong>🤖 AI Chatbot:</strong></h3>
            <p>${result.response}</p>
        `;
    } catch (error) {
        console.error("Request Failed:", error);
        document.getElementById("chatbotResponse").innerHTML = `<p class="error">Request failed. Try again.</p>`;
    }
}

 
async function getMarketPrices() {
    const crop = document.getElementById("crop").value;
    const region = document.getElementById("region").value;

    if (!crop || !region) {
        document.getElementById("pricesResult").innerHTML = `<p class="error">Please select both crop type and region.</p>`;
        return;
    }

    try {
        const response = await fetch("/market_prices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crop, region }),
        });

        const result = await response.json();
        document.getElementById("pricesResult").innerHTML = `
            <h3><strong>💰 Market Prices:</strong></h3>
            <p>${result.prices}</p>
        `;
    } catch (error) {
        console.error("Request Failed:", error);
        document.getElementById("pricesResult").innerHTML = `<p class="error">Request failed. Try again.</p>`;
    }
}

 
async function getFarmingTips() {
    const cropTip = document.getElementById("cropTip").value.trim();

    if (!cropTip) {
        document.getElementById("tipsResult").innerHTML = `<p class="error">Please enter a crop name.</p>`;
        return;
    }

    try {
        const response = await fetch("/farming_tips", {
            method: "POST",  
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ crop: cropTip })   
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        if (result.status === "success") {
            document.getElementById("tipsResult").innerHTML = `
                <h3><strong>📋 Farming Tips:</strong></h3>
                <p>${result.tips}</p>
            `;
        } else {
            document.getElementById("tipsResult").innerHTML = `<p class="error">${result.message}</p>`;
        }
    } catch (error) {
        console.error("Request Failed:", error);
        document.getElementById("tipsResult").innerHTML = `<p class="error">Request failed. Try again.</p>`;
    }
}

 
async function getFarmingPlan() {
    const city = document.getElementById("city").value;
    const budget = document.getElementById("budget").value;

    if (!city || !budget) {
        document.getElementById("planResult").innerHTML = `<p class="error">Please enter both city and budget.</p>`;
        return;
    }

    try {
        const response = await fetch("/plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ city, budget }),
        });

        const result = await response.json();
        document.getElementById("planResult").innerHTML = `
            <h3><strong>📍 Location:</strong> ${result.city}</h3>
            <h3><strong>🌾 Farming Plan:</strong></h3>
            <p>${result.plan}</p>
        `;
    } catch (error) {
        console.error("Request Failed:", error);
        document.getElementById("planResult").innerHTML = `<p class="error">Request failed. Try again.</p>`;
    }
}
