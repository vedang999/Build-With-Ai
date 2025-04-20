import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/generate-history-flyto', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const { server, username, ip, port, password, event } = req.body;

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

    // Step 1: Generate KML to get location data
    const prompt = `
    Generate a minimal valid KML file that includes a single Placemark representing the primary location associated with the historic event: "${event}".
    The Placemark should contain only a <Point> with <coordinates> (longitude,latitude,0) and no other elements.
    Only return the KML content as a single string.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedKML = response.text();

    if (!generatedKML) {
      return res.status(500).json({ success: false, message: "Failed to generate KML from Gemini API" });
    }

    // Step 2: Extract coordinates for FlyTo from the generated KML
    const coordinatesMatch = generatedKML.match(/<coordinates>(.*?)<\/coordinates>/);

    let flyToLongitude, flyToLatitude;
    if (coordinatesMatch && coordinatesMatch[1]) {
      const coordsArray = coordinatesMatch[1].split(',');
      if (coordsArray.length >= 2) {
        flyToLongitude = parseFloat(coordsArray[0]);
        flyToLatitude = parseFloat(coordsArray[1]);
      } else {
        return res.status(400).json({ success: false, message: "Invalid coordinate format in generated KML", generatedKML });
      }
    } else {
      return res.status(400).json({ success: false, message: "Could not find coordinates tag in generated KML", generatedKML });
    }

    // Step 3: Fly to the location
    const flyToPayload = {
      username,
      ip,
      port,
      password,
      longitude: flyToLongitude,
      latitude: flyToLatitude,
      altitude: 2000, // Adjust altitude as needed
      heading: 0,
      tilt: 60, // Adjust tilt as needed
      range: 5000, // Adjust range as needed
      duration: 2, // Duration of the fly-to animation in seconds
    };

    const FLYTO_ENDPOINT = "/api/lg-connection/flyto";
    const flyToResponse = await fetch(server + FLYTO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flyToPayload),
    });

    const flyToResult = await flyToResponse.json();

    if (!flyToResponse.ok) {
      return res.status(flyToResponse.status).json({
        success: false,
        message: "Failed to fly to location",
        error: flyToResult.message,
        stack: flyToResult.stack,
        generatedKML,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully initiated fly-to to the location of the event",
      data: flyToResult,
      generatedKML,
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during fly-to operation",
      error: error.message,
    });
  }
});

export default router;