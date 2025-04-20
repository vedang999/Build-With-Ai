# Build-With-Ai:History Visualiser

An AI-powered application integrating a frontend interface with a Node.js backend, designed to visualize events in the LG RIG environment using the Gemini API.

## ✨ Use Case

This application enables users to explore and visualize geographic or historical events in an immersive Liquid Galaxy environment. By entering an event name, the system generates corresponding KML data via the Gemini API and streams the visualization to the LG rig, making it ideal for educational demos, interactive presentations, and spatial storytelling.

## 📁 Project Structure

```
Build-With-Ai/
├── frontend/           # Frontend files (HTML, CSS, JS)
└── lg-server-main/     # Backend server (Node.js with Express)
```

## 🚀 Getting Started

### 🔧 Prerequisites

- [Node.js](https://nodejs.org/)
- A code editor like [VS Code](https://code.visualstudio.com/)
- [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for VS Code
- A Gemini API key

### 🎨 Frontend Setup

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend
   ```

2. Open `index.html` using Live Server:

   - Right-click `index.html` and choose **"Open with Live Server"**
   - This will launch the frontend in your browser (e.g., `http://127.0.0.1:5500`)

### 🛠️ Backend Setup

1. Navigate to the `lg-server-main` directory:

   ```bash
   cd lg-server-main
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and add your Gemini API key:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

## 🔗 Connecting Frontend and Backend

Make sure both frontend and backend are running:

- **Frontend** via Live Server
- **Backend** on `http://localhost:3000`

The frontend will send requests to the backend to generate visualizations based on event names.

## 🌌 LG RIG Integration

1. **Connect to LG RIG:**

   - In the **Connection** tab, enter the required IP and port settings.

2. **Use Tools:**

   - Access the **Tools** tab to control LG-specific tools.

3. **Visualize Events:**

   - Go to the **Visualization** tab.
   - Enter the name of the event you want to visualize.
   - Press **Enter** to see the visualization on the LG RIG.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js, dotenv
- **API:** Gemini API

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---
<img width="165" alt="{FB8F9F4A-A890-4099-8DD6-16F70B022C5E}" src="https://github.com/user-attachments/assets/ee56a66a-5437-4d51-8b34-52bc0c650a94" />
<img width="169" alt="{6869A198-609B-4E23-BA0F-21CE19429A93}" src="https://github.com/user-attachments/assets/24daa12e-f515-4f67-8f2b-6e18cd38616c" />
<img width="167" alt="{D69B3A4F-8CE0-4B8A-B934-4E32DE57C7E5}" src="https://github.com/user-attachments/assets/e381f09b-32bb-4d3b-ba99-c70dcbbe4cf1" />
<img width="953" alt="{8EDEE7F0-6EF0-42F4-ABB5-03D15334C94D}" src="https://github.com/user-attachments/assets/70083116-da4a-4a9f-a690-eb45cd47d27b" />


Feel free to contribute or suggest improvements!
