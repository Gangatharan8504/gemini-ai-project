const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const typingIndicator = document.getElementById("typingIndicator");
const loginStatus = document.getElementById("loginStatus");

let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

window.onload = () => {
    loadTheme();
    checkLogin();
    renderHistory();

    if (chatHistory.length === 0) {
        addMessage("bot", "Hello! I am your Gemini AI assistant. Ask me anything.");
    }
};

messageInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

async function checkLogin() {
    try {
        const res = await fetch("/me");
        const data = await res.json();

        if (data.logged_in) {
            loginStatus.textContent = `Logged in as ${data.username}`;
        }
    } catch {
        loginStatus.textContent = "Guest mode";
    }
}

async function loginUser() {
    const username = document.getElementById("usernameInput").value.trim();

    if (!username) {
        alert("Enter your name");
        return;
    }

    const res = await fetch("/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username})
    });

    const data = await res.json();

    if (data.success) {
        loginStatus.textContent = `Logged in as ${data.username}`;
    }
}

function addMessage(sender, text, save = true) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.innerHTML = sender === "user"
        ? '<i class="fa-solid fa-user"></i>'
        : '<i class="fa-solid fa-robot"></i>';

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    if (sender === "bot") {
        bubble.innerHTML = marked.parse(text);
    } else {
        bubble.textContent = text;
    }

    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;

    if (save) {
        chatHistory.push({sender, text});
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
}

async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;

    addMessage("user", message);
    messageInput.value = "";
    typingIndicator.classList.remove("hidden");

    try {
        const res = await fetch("/chat", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({message})
        });

        const data = await res.json();
        typingIndicator.classList.add("hidden");
        addMessage("bot", data.reply);

        speakText(data.reply);

    } catch (error) {
        typingIndicator.classList.add("hidden");
        addMessage("bot", "Network error. Please check your server.");
    }
}

function renderHistory() {
    chatBox.innerHTML = "";
    chatHistory.forEach(item => addMessage(item.sender, item.text, false));
}

function clearHistory() {
    localStorage.removeItem("chatHistory");
    chatHistory = [];
    chatBox.innerHTML = "";
    addMessage("bot", "Chat history cleared. Start a new conversation.");
}

function newChat() {
    chatBox.innerHTML = "";
    chatHistory = [];
    localStorage.removeItem("chatHistory");
    addMessage("bot", "New chat started. How can I help?");
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

function loadTheme() {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        document.body.classList.add("dark");
    }
}

function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input is not supported in this browser. Use Google Chrome.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = function(event) {
        messageInput.value = event.results[0][0].transcript;
    };
}

function speakText(text) {
    if (!window.speechSynthesis) return;

    const cleanText = text.replace(/[#*_`>\[\]()]/g, " ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}
