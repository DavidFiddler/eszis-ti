const apiKey = "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";

// Web Speech API inicializálás
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "hu-HU";
recognition.interimResults = false;

const synth = window.speechSynthesis;

let isActive = false;
let isSpeaking = false;

// Beszéd felismerése
recognition.onresult = async (event) => {
  const spokenText = event.results[0][0].transcript.toLowerCase();
  console.log("Felismert szöveg:", spokenText);

  if (!isActive && spokenText.includes("süti")) {
    document.querySelector(".status").innerText = "Hallgatlak...";
    isActive = true;
  } else if (isActive && !isSpeaking) {
    document.querySelector(".status").innerText = `Feldolgozás: "${spokenText}"`;
    const response = await getAIResponse(spokenText);
    speakText(response);
    isActive = false;
    document.querySelector(".status").innerText = "Várakozás a hívószóra: \"Süti\"";
  }
};

// Hanggenerálás
function speakText(text) {
  console.log("Hangalapú válasz készítése: ", text); // Ellenőrizzük, hogy a funkció elérhető-e
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "hu-HU";

  // Különleges események a hangszintézishez
  utterance.onstart = () => {
    isSpeaking = true;
    console.log("Beszéd indítása...");
  };

  utterance.onend = () => {
    isSpeaking = false;
    console.log("Beszéd vége...");
  };

  // Ha valami hiba történik
  utterance.onerror = (event) => {
    console.error("Hiba történt a beszéd lejátszása közben:", event.error);
  };

  synth.speak(utterance);
}

// OpenAI API hívás
async function getAIResponse(prompt) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150
    })
  });

  const data = await response.json();

  if (response.ok) {
    return data.choices[0].message.content.trim();
  } else {
    console.error("Hiba történt:", data);
    return "Sajnálom, hiba történt a kérdés feldolgozása közben.";
  }
}

// Beszéd leállítása
document.getElementById("stopButton").addEventListener("click", () => {
  synth.cancel(); // Az összes folyamatban lévő beszédet leállítja
  isSpeaking = false; // Állapot visszaállítása
  document.querySelector(".status").innerText = "A beszéd leállítva.";
});

// Mikrofon elindítása
recognition.start();
recognition.onend = () => recognition.start();
