const ENDPOINT_GENERATE = "/api/generate";
import { speakGrandpaStyle } from "./tts.mjs";
export const generateVisualisation = async (eventName) => {
  try {
    const configs = JSON.parse(localStorage.getItem("lgconfigs"));
    if (!configs) throw new Error("LG configs not found.");

    const { server, username, ip, port, password, screens = 3 } = configs;

    const requestBody = {
      server,
      username,
      ip,
      port,
      password,
      screens,
      event: eventName,
    };

    console.log("Sending generation request:", requestBody);

    const response = await fetch(server + ENDPOINT_GENERATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${errorText}`);
    }

    const data = await response.json();

    // 🔊 Start narration here after successful generation
    const narration = data.description || `Let me tell you a tale about ${eventName}...`;
    speakGrandpaStyle(narration);

    return data;
  } catch (err) {
    console.error("Visualisation generation failed:", err);
    throw err;
  }
};
