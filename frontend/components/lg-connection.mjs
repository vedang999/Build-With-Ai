// lg-connection.mjs
export class LGConnectionForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Create container and form structure
    const container = document.createElement("div");
    container.classList.add("lg-connection-form");

    container.innerHTML = `
      <p id="connection-status">Status: <span style="font-weight:bold;">Disconnected</span></p>
      <form id="lg-connection-form">
        <label>Server Address*</br><input name="server" required></label>
        <label>Username*</br><input name="username" required></label>
        <label>IP Address*</br><input name="ip" required></label>
        <label>Port Number*</br><input name="port" type="number" required></label>
        <label>Password*</br><input name="password" type="password" required></label>
        <label>Number of Screens</br><input name="screens" type="number" min="1"></label>
        <button type="submit">Connect to LG</button>
      </form>
      <img src="./assets/lg-logo.png" alt="LG Logo" style="margin-top: 20px; width: 50px; opacity: 0.9;" />
      <p style="margin-top: 20px; font-size: 0.8rem; color: #999;">
      Made by Vedang Lokhande as a part of  #BuildWithAI Challenge of LG 2025
    </p>
    `;

    // Style block for the form
    const style = document.createElement("style");
    style.textContent = `
      .lg-connection-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      }

      .lg-connection-form form {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 300px;
      }

      .lg-connection-form label {
        margin-bottom: 10px;
        font-size: 16px;
      }

      .lg-connection-form input {
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      .lg-connection-form button {
        padding: 10px;
        background-color: #6200ea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .lg-connection-form button:hover {
        background-color: #3700b3;
      }

      #connection-status {
        font-size: 18px;
        margin-bottom: 20px;
      }
    `;

    this.shadowRoot.append(style, container);
  }

  connectedCallback() {
    const form = this.shadowRoot.querySelector("#lg-connection-form");
    const connectionStatus = this.shadowRoot.querySelector("#connection-status");
    const statusText = connectionStatus.querySelector("span");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const server = form.server.value;
      const username = form.username.value;
      const ip = form.ip.value;
      const port = form.port.value;
      const password = form.password.value;
      const screens = form.screens.value;

      // Simulating connection logic here
      this.handleConnection({
        server,
        username,
        ip,
        port,
        password,
        screens,
        statusText,
      });
    });
  }

  handleConnection({ server, username, ip, port, password, screens, statusText }) {
    console.log("Attempting connection with the following details:");
    console.log({ server, username, ip, port, password, screens });

    // Simulate successful connection (you can replace this with real connection logic)
    setTimeout(() => {
      statusText.textContent = "Connected";
      statusText.style.color = "green";
    }, 2000);

    // You can also simulate an error for failure
    // setTimeout(() => {
    //   statusText.textContent = "Disconnected";
    //   statusText.style.color = "red";
    // }, 2000);
  }
}

// Define the custom element
customElements.define("lg-connection-form", LGConnectionForm);
