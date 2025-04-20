import express from 'express';
import fetch, { Response } from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import * as fs from "node:fs/promises";
import path from 'path';
import FormData from 'form-data';

dotenv.config();

const router = express.Router();

router.post('/show-nagpur-placemarks-balloon', async (req, res) => {
  try {
    const { server, username, ip, port, password, screens = 3 } = req.body;

    if (!server || !username || !ip || !port || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required Liquid Galaxy connection parameters",
      });
    }

    const kmlFilename = "nagpur_places";

    // Step 1: Generate KML string
    const getNagpurKML = () => `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Zero Mile Stone</name>
      <Point>
        <coordinates>79.1010,21.1497,0</coordinates>
      </Point>
    </Placemark>
    <Placemark>
      <name>Futala Lake</name>
      <Point>
        <coordinates>79.0527,21.1471,0</coordinates>
      </Point>
    </Placemark>
    <Placemark>
      <name>Deekshabhoomi</name>
      <Point>
        <coordinates>79.0706,21.1312,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

    // Step 2: Send KML file
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    const kmlContent = getNagpurKML();
    const filePath = path.join(tempDir, `${kmlFilename}.kml`);
    await fs.writeFile(filePath, kmlContent);

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
        message: "Failed to send Nagpur KML",
        error: kmlResult.message,
        stack: kmlResult.stack,
      });
    }

    // Step 3: Show hardcoded Nagpur balloon
    const customKMLString = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2"
  xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">
  <Document>
    <name>Nagpur Balloon</name>
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
    <Placemark id="NagpurBalloon">
      <name>Nagpur</name>
      <description><![CDATA[
        <h2><font color='#00CC99'>Nagpur, India</font></h2>
        <h3><font color='#00CC99'>City of Oranges</font></h3>
        <p><font color="#3399CC">Nagpur is a major city in Maharashtra known for its oranges and educational institutions. It is also the geographical center of India.</font></p>
      ]]></description>
      <LookAt>
        <longitude>79.0882</longitude>
        <latitude>21.1458</latitude>
        <altitude>0</altitude>
        <heading>0</heading>
        <tilt>0</tilt>
        <range>24000</range>
      </LookAt>
      <styleUrl>#simple_style</styleUrl>
      <gx:balloonVisibility>1</gx:balloonVisibility>
      <Point>
        <coordinates>79.0882,21.1458,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;

    const kmlRes = new Response(customKMLString);
    const balloonKml = await kmlRes.text();

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
        kml: balloonKml,
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
      message: "Nagpur placemarks KML sent and balloon shown successfully",
      data: { kmlResult, balloonResult },
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during Nagpur KML and balloon display",
      error: error.message,
    });
  }
});

export default router;
