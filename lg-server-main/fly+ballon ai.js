import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch, { Response } from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/generate-history-flyto-hardcoded-balloon-test', async (req, res) => {
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
    const prompt = `Provide the longitude & the latitude (as a comma-separated pair),dont shuffle lat long & give longitude first and a concise (min 30 words max 70 words) description for the historic event: "${event}".`;

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

export default router;