import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch, { Response } from 'node-fetch';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs/promises"; // for async/await
import * as fsSync from "node:fs";       // for sync methods like writeFileSync
import { Blob } from 'buffer';

import path from "path";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

const router = express.Router();

router.post('/generate', async (req, res) => {
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

    // Step 1: Ask Gemini for location data
    const prompt = `Provide the longitude & the latitude (as a comma-separated pair),dont shuffle lat long & give longitude first and a concise (min 30 words max 40 words) description for the historic event: "${event}".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const locationData = response.text();

    if (!locationData) {
      return res.status(500).json({ success: false, message: "Failed to get location data from Gemini API" });
    }

    const parts = locationData.split(',');
    if (parts.length < 2) {
      return res.status(400).json({ success: false, message: "Invalid location data format from Gemini", data: locationData });
    }

    const flyToLongitude = parseFloat(parts[0].trim());
    const flyToLatitude = parseFloat(parts[1].trim());
    const description = parts.slice(2).join(',').trim() || `Information about ${event}.`;
// console.log(description);
    if (isNaN(flyToLongitude) || isNaN(flyToLatitude)) {
      return res.status(400).json({ success: false, message: "Invalid coordinates from Gemini", data: locationData });
    }

    // Step 2: Fly to the location
    const FLYTO_ENDPOINT = "/api/lg-connection/flyto";
    const flytoResponse = await fetch(server + FLYTO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        ip,
        port,
        password,
        latitude: flyToLatitude,
        longitude: flyToLongitude,
        altitude: 2000, // Adjust as needed
        heading: 0,
        tilt: 60, // Adjust as needed
        range: 5000, // Adjust as needed
        duration: 2, // Adjust as needed
      }),
    });

    const flytoResult = await flytoResponse.json();

    if (!flytoResponse.ok) {
      console.error("Failed to fly to location:", flytoResult);
    } else {
      console.log("Successfully initiated fly-to.");
    }
// Step 0: Clean previous balloons
    const CLEAN_BALLOON_ENDPOINT = "/api/lg-connection/clean-balloon";
    const cleanBalloonResponse = await fetch(server + CLEAN_BALLOON_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        ip,
        port,
        password,
        screens,
      }),
    });

    const cleanBalloonResult = await cleanBalloonResponse.json();

    if (!cleanBalloonResponse.ok) {
      console.error("Failed to clean previous balloons:", cleanBalloonResult);
    } else {
      console.log("Successfully initiated cleaning of previous balloons.");
    }

// Step 2.5: Get the generated image for the event
const imageResponse = await fetch(`${server}/api/genai`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ event }),
});

const imageData = await imageResponse.json();

if (!imageResponse.ok || !imageData.success) {
  console.warn("Image generation failed, continuing without image");
}
const imageHtml = imageData?.imageUrl
  ? `<img src="${imageData.imageUrl}" width="500px" height="auto" /><br/>`
  : "";
  console.log(imageHtml);
    // Step 2: Simulate fetching a KML file from a URL using an inline string
    const customKMLString = `<?xml version="1.0" encoding="UTF-8"?>
    <kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2"
  xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
  <Document>
    <name>Event balloon</name>
    <Style id="simple_style">
      <IconStyle>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/shapes/info-i.png</href>
        </Icon>
      </IconStyle>
      <BalloonStyle>
        <text>$[description]</text>
        <bgColor>ff1e1e1e</bgColor>
      </BalloonStyle>
    </Style>
    <Placemark id="EventBalloon">
      <name>Nagpur</name>
      <description><![CDATA[
        <h2 style="text-transform: uppercase;"><font color='#00CC99'>${event}</font></h2>
        <h3><font color='#FFA500'>${flyToLongitude},${flyToLatitude}</font></h3>
          <p><font color="#3399CC">${description}</font></p>
          ${imageHtml}
      ]]></description>
      <LookAt>
              <longitude>${flyToLongitude}</longitude>
            <latitude>${flyToLatitude}</latitude>
        <altitude>0</altitude>
        <heading>0</heading>
        <tilt>0</tilt>
        <range>24000</range>
      </LookAt>
      <styleUrl>#simple_style</styleUrl>
      <gx:balloonVisibility>1</gx:balloonVisibility>
      <Point>
        <coordinates>${flyToLatitude},${flyToLongitude},0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

    // Simulate a fetch to keep: const kml = await kmlRes.text();
    const kmlRes = new Response(customKMLString);
    const kml = await kmlRes.text();

    // Step 3: Send balloon
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
        kml,
      }),
    });

    const balloonResult = await balloonResponse.json();

    if (!balloonResponse.ok) {
      return res.status(balloonResponse.status).json({
        success: false,
        message: "Failed to show balloon",
        error: balloonResult.message,
        stack: balloonResult.stack,
      });
    }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Step 2.5: Generate image for the historic area near the event
const historicImageResponse = await fetch(`${server}/api/genai`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({  
    //  event: `Generate a theatrical, artistic, and fictional map of the area around the historic event: "${event}". The map should have a vintage, ancient, or medieval style, resembling the cartography of that era. The map should feature exaggerated topography, fictional landmarks, and artistic elements, making it feel like a mix of reality and fantasy. The style should be reminiscent of old explorers' maps, with hand-drawn details, unusual iconography, and parchment-like textures. It should be suitable for overlaying on modern maps with a slightly surreal or mysterious tone.`
    // event: `Create a landscape-oriented, vintage-style map of the region surrounding "${event}". The map should reflect an old-world, historical aesthetic—similar to medieval or ancient cartography. It should include lightly detailed terrain, hills, and rivers, and be styled like aged parchment with hand-drawn textures and artistic embellishments. Include fictional or symbolic landmarks, whimsical compass roses, and border illustrations for atmosphere. The tone should be mysterious and nostalgic, blending realism with fantasy, suitable for use as a standalone artistic overlay.`
    event:`Create a high-resolution, landscape-oriented image styled as an antique or vintage map from the 17th to 19th century. Focus on the region related to the [EVENT NAME], with historical terrain features such as rivers, forests, and elevation indicated through classic hatching or hill-shading techniques. The map should include old-style fonts, aged parchment textures, and decorative elements like compass roses, borders, or small illustrations. Avoid any modern icons, branding, or interface elements—this should look like an authentic historical artifact.`
  }),
});

const historicImageData = await historicImageResponse.json();

if (!historicImageResponse.ok || !historicImageData.success) {
  console.warn("Historic area image generation failed, continuing without image");
}

// Step 4.2: Generate Overlay KML string for the historic area
if (historicImageData?.imageUrl) {
  const kmlFilename = "historic_area_overlay";

  // Step 4.1: Generate Overlay KML string
  const getOverlayKML = () => `<?xml version="1.0" encoding="UTF-8"?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
    <Document>
      <GroundOverlay>
        <name>Event Image Overlay</name>
        <Icon>
          <href>${historicImageData.imageUrl}</href>
        </Icon>
        <LatLonBox>
          <north>${flyToLatitude + 0.25}</north>
          <south>${flyToLatitude - 0.25}</south>
          <east>${flyToLongitude + 0.1}</east>
          <west>${flyToLongitude - 0.1}</west>
          <rotation>0</rotation>
        </LatLonBox>
      </GroundOverlay>
    </Document>
  </kml>`;
  

  // Step 4.2: Write KML to temp and send
  const tempDir = path.join(process.cwd(), 'temp');
  await fs.mkdir(tempDir, { recursive: true });

  const kmlContent = getOverlayKML();
  const filePath = path.join(tempDir, `${kmlFilename}.kml`);
  await fs.writeFile(filePath, kmlContent);

  const formData = new FormData();
  formData.append("username", username);
  formData.append("ip", ip);
  formData.append("port", port);
  formData.append("password", password);
  formData.append("filename", kmlFilename);

  const fileBuffer = await fs.readFile(filePath);
  // formData.append("file", fileBuffer, { filename: `${kmlFilename}.txt` });
  const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
  formData.append("file", blob, `${kmlFilename}.txt`); // ✅ works with undici
  
  const KML_ENDPOINT = "/api/lg-connection/send-kml";
  const kmlResponse = await fetch(server + KML_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  const kmlResult = await kmlResponse.json();
  await fs.unlink(filePath);

  if (!kmlResponse.ok) {
    console.warn("Image overlay KML failed:", kmlResult.message);
  } else {
    console.log("Image overlay KML sent successfully.");
  }
}

    return res.status(200).json({
      success: true,
      message: "Flew to location and showed hardcoded Nagpur balloon",
      data: { flytoResult, balloonResult, locationData },
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during fly-to and hardcoded Nagpur balloon display",
      error: error.message,
    });
  }
});

router.post("/genai", async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const { event } = req.body;

  if (!apiKey) {
    return res.status(400).json({ success: false, error: "GEMINI_API_KEY not found in environment variables" });
  }

  if (!event) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameter: event",
    });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: event,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    let imageSaved = false;
    let imageUrl = "";

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");

        const fileName = `event-${uuidv4().slice(0, 8)}.jpg`; // unique file name
        const filePath = path.join(process.cwd(), "public", "assets", fileName);
        fsSync.writeFileSync(filePath, buffer);

        imageUrl = `http://192.168.56.1:3000/assets/${fileName}`;
        imageSaved = true;
        break;
      }
    }

    if (!imageSaved) {
      return res.status(500).json({ success: false, message: "Image not generated or returned by model." });
    }

    return res.status(200).json({
      success: true,
      message: "Image generated and saved successfully",
      imageUrl,
    });

  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during image generation",
      error: error.message,
    });
  }
});

export default router;
