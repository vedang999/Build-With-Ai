import { cleankml } from "../api/cleankml.mjs";
import { cleanlogo } from "../api/logo.mjs";
import { cleanballoon } from "../api/balloon.mjs";
import { reboot } from "../api/reboot.mjs";
import { relaunch } from "../api/relaunch.mjs";
import { shutdown } from "../api/shutdown.mjs";

export class LGtools extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.classList.add("container");

    container.innerHTML = `
      <md-dialog class="dialog">
        <form slot="content" id="form-id" method="dialog">Are you sure you want to perform this action?</form>
        <div slot="actions">
          <md-text-button form="form-id" value="cancel">Cancel</md-text-button>
          <md-filled-button form="form-id" value="yes">Proceed</md-filled-button>
        </div>
      </md-dialog>

      <div class="button-wrapper">
        <md-filled-tonal-button data-action="clean-logo">Clean Logo</md-filled-tonal-button>
        <md-filled-tonal-button data-action="clean-kml">Clean KML</md-filled-tonal-button>
        <md-filled-tonal-button data-action="clean-balloon">Clean Balloon</md-filled-tonal-button>
        <md-filled-tonal-button data-action="relaunch-lg">Relaunch LG</md-filled-tonal-button>
        <md-filled-tonal-button data-action="reboot-lg">Reboot LG</md-filled-tonal-button>
        <md-filled-tonal-button data-action="shutdown-lg">Shutdown LG</md-filled-tonal-button>
      </div>
    `;

    const style = document.createElement("style");
    style.textContent = `
      .container {
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        transition: all 0.3s ease;
      }

      .dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        display: none; /* Hidden by default */
        max-width: 400px;
        width: 100%;
      }

      .container.blur {
        backdrop-filter: blur(8px); /* Apply blur effect to the background */
      }

      .button-wrapper {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 15px;
        padding: 30px;
        width: 100%;
        max-width: 800px;
      }

      md-filled-tonal-button {
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 8px;
        transition: all 0.3s ease;
        background-color: #6200ea;
        color: white;
        border: none;
      }

      md-filled-tonal-button:hover {
        background-color: #3700b3;
        transform: scale(1.05);
      }

      md-filled-tonal-button:active {
        background-color: #6200ea;
        transform: scale(0.98);
      }

      md-text-button {
        font-size: 16px;
        font-weight: 600;
        padding: 10px 20px;
        color: #6200ea;
        border-radius: 5px;
        transition: all 0.3s ease;
      }

      md-text-button:hover {
        background-color: rgba(98, 0, 234, 0.1);
      }

      md-filled-button {
        background-color: #6200ea;
        color: white;
        border-radius: 8px;
        padding: 10px 20px;
        transition: all 0.3s ease;
      }

      md-filled-button:hover {
        background-color: #3700b3;
        transform: scale(1.05);
      }

      md-filled-button:active {
        background-color: #6200ea;
        transform: scale(0.98);
      }
    `;

    this.shadowRoot.append(style, container);
  }

  connectedCallback() {
    const buttons = this.shadowRoot.querySelectorAll("md-filled-tonal-button");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.getAttribute("data-action");
        this.handleAction(action);
      });
    });
  }

  handleAction(action) {
    switch (action) {
      case "clean-logo":
        cleanlogo();
        break;
      case "clean-kml":
        cleankml();
        break;
      case "clean-balloon":
        cleanballoon();
        break;
      case "relaunch-lg":
        this.confirmAction("Relaunch the Liquid Galaxy?", relaunch);
        break;
      case "reboot-lg":
        this.confirmAction("Reboot the Liquid Galaxy?", reboot);
        break;
      case "shutdown-lg":
        this.confirmAction("Shutdown the Liquid Galaxy?", shutdown);
        break;
      default:
        console.warn("Unknown action:", action);
    }
  }

  confirmAction(message, actionFn) {
    const dialog = this.shadowRoot.querySelector("md-dialog");
    const container = this.shadowRoot.querySelector(".container");

    dialog.querySelector("form").textContent = message;
    dialog.style.display = 'block'; // Show the dialog
    container.classList.add("blur"); // Apply the blur effect to the background

    const proceedBtn = dialog.querySelector("md-filled-button");
    const clonedBtn = proceedBtn.cloneNode(true);
    proceedBtn.replaceWith(clonedBtn); // Remove previous listeners
    clonedBtn.addEventListener("click", async () => {
      await actionFn();
      dialog.style.display = 'none'; // Hide the dialog after action
      container.classList.remove("blur"); // Remove the blur effect
    });

    const cancelBtn = dialog.querySelector("md-text-button");
    cancelBtn.addEventListener("click", () => {
      dialog.style.display = 'none'; // Hide the dialog if cancelled
      container.classList.remove("blur"); // Remove the blur effect
    });
  }
}

customElements.define("lg-tools", LGtools);
