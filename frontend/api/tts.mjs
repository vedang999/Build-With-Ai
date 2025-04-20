let grandpaVoice = null;

function loadVoices() {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  const englishVoices = voices.filter(v => v.lang.startsWith("en"));
  console.log("Available English Voices:", englishVoices);
  grandpaVoice = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("english")) || voices[0];
}

speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

export function speakGrandpaStyle(text) {
  if (!("speechSynthesis" in window)) {
    console.warn("Text-to-Speech not supported.");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = grandpaVoice;
  utterance.pitch = 0.6;
  utterance.rate = 0.75;
  utterance.volume = 1;
  speechSynthesis.speak(utterance);
}
