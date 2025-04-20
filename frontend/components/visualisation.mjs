import { generateVisualisation } from "../api/generate.mjs";
import { speakGrandpaStyle } from "../api/tts.mjs";

export class VisualisationForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const container = document.createElement("div");
    container.classList.add("visualisation-form");

    container.innerHTML = `
      <form id="visualisation-form">
        <label>Event Name</br><input name="eventName" required></label>
        <button type="submit">Send</button>
      </form>
      </br>
      
      `;
      // <button id="narrate-button">🎙️ Play Grandpa Narration1</button>

    const style = document.createElement("style");
    style.textContent = `
      .visualisation-form {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
      }

      .visualisation-form form {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 300px;
      }

      .visualisation-form label {
        margin-bottom: 10px;
        font-size: 16px;
      }

      .visualisation-form input {
        padding: 8px;
        margin-bottom: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      .visualisation-form button {
        padding: 10px;
        background-color: #6200ea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .visualisation-form button:hover {
        background-color: #3700b3;
      }
    `;

    this.shadowRoot.append(style, container);
  }

  // connectedCallback() {
  //   const form = this.shadowRoot.querySelector("#visualisation-form");

  //   form.addEventListener("submit", async (e) => {
  //     e.preventDefault();

  //     const eventName = form.eventName.value;

  //     try {
  //       await generateVisualisation(eventName);
  //       alert("Generation completed successfully!");
  //     } catch (err) {
  //       alert("Generation failed. Check console for details.");
  //     }
  //   });
  // }
  connectedCallback() {
    const form = this.shadowRoot.querySelector("#visualisation-form");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const eventName = form.eventName.value;
  
      try {
        await generateVisualisation(eventName);
        alert("Generation completed successfully!");
      } catch (err) {
        alert("Generation failed. Check console for details.");
      }
    });
    // const narrateBtn = this.shadowRoot.querySelector("#narrate-button");
    // if (narrateBtn) {
    //   narrateBtn.addEventListener("click", () => {
    //     speakGrandpaStyle("Back in my day, this land saw legends unfold under dusty skies...");
    //   });
    // } else {
    //   console.warn("Narrate button not found in DOM.");
    // }
    
  }
  
}

customElements.define("visualisation-form", VisualisationForm);
