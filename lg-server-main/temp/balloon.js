import express from 'express';
import fetch, { Response } from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

router.post('/flyto-nagpur-show-balloon', async (req, res) => {
  try {
    const { server, username, ip, port, password, screens = 3 } = req.body;

    if (!server || !username || !ip || !port || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required Liquid Galaxy connection parameters",
      });
    }

    // Step 1: Fly to Nagpur
    const FLYTO_ENDPOINT = "/api/lg-connection/flyto";
    const flytoResponse = await fetch(server + FLYTO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        ip,
        port,
        password,
        latitude: 21.1458,
        longitude: 79.0882,
        elevation: 0,
        tilt: 0,
        bearing: 0,
      }),
    });

    const flytoResult = await flytoResponse.json();

    if (!flytoResponse.ok) {
      return res.status(flytoResponse.status).json({
        success: false,
        message: "Failed to fly to Nagpur",
        error: flytoResult.message,
        stack: flytoResult.stack,
      });
    }

    // Step 2: Simulate fetching a KML file from a URL using an inline string
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
      message: "Flew to Nagpur and showed custom balloon successfully",
      data: balloonResult,
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during Nagpur flyto and balloon display",
      error: error.message,
    });
  }
});

export default router;

// const FLYTO_ENDPOINT = "/api/lg-connection/flyto";
// const flytoResponse = await fetch(server + FLYTO_ENDPOINT, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     username,
//     ip,
//     port,
//     password,
//     latitude: 21.1458,
//     longitude: 79.0882,
//     elevation: 0,
//     tilt: 0,
//     bearing: 0,
//   }),
// });

// const flytoResult = await flytoResponse.json();

// const customKMLString = `<?xml version="1.0" encoding="UTF-8"?>
// <kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2"
// </kml>`;

//     // Simulate a fetch to keep: const kml = await kmlRes.text();
//     const kmlRes = new Response(customKMLString);
//     const kml = await kmlRes.text();    const SHOW_BALLOON_ENDPOINT = "/api/lg-connection/show-balloon";

    // const balloonResponse = await fetch(server + SHOW_BALLOON_ENDPOINT, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     username,
    //     ip,
    //     port,
    //     password,
    //     screens,
    //     kml,
    //   }),
    // });

    // const balloonResult = await balloonResponse.json();

    // const getSpainKML = () => `<?xml version="1.0" encoding="UTF-8"?>
    // <kml xmlns="http://www.opengis.net/kml/2.2">
    // </kml>`;
    //     // Step 2: Send KML file
    //     // Create temp directory if it doesn't exist
    //     const tempDir = path.join(process.cwd(), 'temp');
    //     await fs.mkdir(tempDir, { recursive: true });
        
    //     // Generate KML content and save to temporary file
    //     const kmlContent = getSpainKML();
    //     const filePath = path.join(tempDir, `${kmlFilename}.kml`);
    //     await fs.writeFile(filePath, kmlContent);
        
    //     // Prepare form data for KML upload
    //     const formData = new FormData();
    //     formData.append("username", username);
    //     formData.append("ip", ip);
    //     formData.append("port", port);
    //     formData.append("password", password);
    //     formData.append("filename", kmlFilename);
        
    //     // Read KML file and add to form
    //     const fileBuffer = await fs.readFile(filePath);
    //     formData.append("file", fileBuffer, { filename: `${kmlFilename}.txt` });
        
    //     // Send KML to Liquid Galaxy
    //     const KML_ENDPOINT = "/api/lg-connection/send-kml";
    //     const kmlResponse = await fetch(server + KML_ENDPOINT, {
    //       method: "POST",
    //       body: formData,
    //     });
        
    //     const kmlResult = await kmlResponse.json();
        
    //     // Clean up temp file
    //     await fs.unlink(filePath);