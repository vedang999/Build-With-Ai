import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';

dotenv.config();

const router = express.Router();

router.post('/generate-history-flyto-kml', async (req, res) => {
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

    // Step 1: Generate KML with a Placemark
    const prompt = `
    Generate a valid KML file that visualizes the historic event: "${event}".

    The KML should include:
    1. One prominent Placemark representing the primary location associated with this event.
    2. The Placemark should have a descriptive <name> related to the event.
    3. Include a <description> tag within the Placemark that provides a brief overview of the event.
    4. Include the <Point> coordinates (longitude,latitude,0) for the Placemark.
    5. The root <kml> element should include the xmlns attribute.

    Only return the complete KML content as a single string. Do not include any introductory or concluding remarks or code block delimiters.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawGeneratedKML = response.text();

    console.log("Raw Generated KML from Gemini:\n", rawGeneratedKML); // Log the raw output

    // Clean up the KML string
    const generatedKML = rawGeneratedKML.replace(/```(xml)?\n?/g, '').replace(/```/g, '').trim();

    if (!generatedKML) {
      return res.status(500).json({ success: false, message: "Failed to generate or clean KML from Gemini API" });
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
    let flyToResult = { message: "Fly-to not initiated", statusCode: 200, data: null };
    if (flyToLongitude !== undefined && flyToLatitude !== undefined) {
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

      flyToResult = await flyToResponse.json();

      if (!flyToResponse.ok) {
        console.error("Failed to fly to location:", flyToResult);
      } else {
        console.log("Successfully initiated fly-to.");
      }
    }

    // Step 4: Send the generated KML file to the LG rig
    const kmlFilename = `history_event_${Date.now()}`;
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });
    const filePath = path.join(tempDir, `${kmlFilename}.kml`);
    await fs.writeFile(filePath, generatedKML);

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
      console.error("Failed to send generated KML to LG:", kmlResult);
    } else {
      console.log("Generated KML sent successfully.");
    }

    return res.status(200).json({
      success: true,
      message: "Flew to location and sent KML with placemark",
      data: { flyToResult, kmlResult, generatedKML },
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during fly-to and KML sending",
      error: error.message,
    });
  }
});

export default router;