import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch, { Response } from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';

dotenv.config();

const router = express.Router();

router.post('/generate-history-kml-balloon', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const { server, username, ip, port, password, screens = 3, event } = req.body;

  if (!apiKey) {
    return res.status(400).json({ success: false, error: 'GEMINI_API_KEY not found in environment variables' });
  }

  if (!server || !username || !ip || !port || !password || !event) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters (server, username, ip, port, password, event)",
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

    // Step 1: Generate KML string with a Placemark and a Balloon
    const prompt = `
    Generate a valid KML file that visualizes the historic event: "${event}".

    The KML should include:
    1. One prominent Placemark representing the primary location associated with this event.
    2. The Placemark should have a descriptive <name> related to the event.
    3. Include a <description> tag within the Placemark that provides a brief overview of the event. This description will be used as the content of the balloon. Format the description with basic HTML for better readability (e.g., using <h2> for the event name and <p> for a short summary).
    4. Add a <LookAt> tag that focuses on the location of the Placemark, with appropriate longitude, latitude, altitude (set to 0), heading (0), tilt (0), and range for a good viewing distance.
    5. The root <kml> element should include the xmlns attribute.

    Only return the complete KML content as a single string. Do not include any introductory or concluding remarks or code block delimiters.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawGeneratedKML = response.text();

    console.log("Raw Generated KML from Gemini:\n", rawGeneratedKML); // Log the raw output

    // Clean up the KML string by removing any leading/trailing backticks or code block identifiers
    const generatedKML = rawGeneratedKML.replace(/```(xml)?\n?/g, '').replace(/```/g, '').trim();

    if (!generatedKML) {
      return res.status(500).json({ success: false, message: "Failed to generate or clean KML from Gemini API" });
    }

    const kmlFilename = `history_event_${Date.now()}`;
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const filePath = path.join(tempDir, `${kmlFilename}.kml`);
    await fs.writeFile(filePath, generatedKML);

    // Step 2: Send the generated KML file to the LG rig
    const formData = new FormData();
    formData.append("username", username);
    formData.append("ip", ip);
    formData.append("port", port);
    formData.append("password", password);
    formData.append("filename", kmlFilename);

    const fileBuffer = await fs.readFile(filePath);
    formData.append("file", fileBuffer, { filename: `${kmlFilename}.txt` });

    const KML_ENDPOINT = "/api/lg-connection/send-kml";
    const kmlResponse = await fetch(server + KML_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    const kmlResult = await kmlResponse.json();
    await fs.unlink(filePath);

    if (!kmlResponse.ok) {
      return res.status(kmlResponse.status).json({
        success: false,
        message: "Failed to send generated KML to LG",
        error: kmlResult.message,
        stack: kmlResult.stack,
      });
    }

    // Step 3: Construct KML to show the balloon for the generated Placemark
    const showBalloonKML = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
<Document>
  <Placemark targetId="${kmlFilename}-0">
    <gx:balloonVisibility>1</gx:balloonVisibility>
  </Placemark>
</Document>
</kml>`;

    const SHOW_BALLOON_ENDPOINT = "/api/lg-connection/show-balloon";
    const balloonResponse = await fetch(server + SHOW_BALLOON_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        ip,
        port,
        password,
        screens,
        kml: showBalloonKML,
      }),
    });

    const balloonResult = await balloonResponse.json();

    if (!balloonResponse.ok) {
      return res.status(balloonResponse.status).json({
        success: false,
        message: "Failed to show balloon for generated placemark",
        error: balloonResult.message,
        stack: balloonResult.stack,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Generated history event KML sent and balloon shown successfully",
      data: { kmlResult, balloonResult, generatedKML },
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during history event KML generation and display",
      error: error.message,
    });
  }
});

export default router;