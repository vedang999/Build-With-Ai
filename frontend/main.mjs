import { connectToLG } from './connect.mjs';
import "./components/tools.mjs";
import "./components/visualisation.mjs";
import "./components/lg-connection.mjs";

document.addEventListener('DOMContentLoaded', () => {
  // --- TAB SWITCHING ---
  const tabs = document.querySelectorAll('.tabs button');
  const sections = document.querySelectorAll('.tab-content');

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(tab => tab.classList.remove('active'));
      sections.forEach(sec => sec.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });

  // --- CONNECTION FORM ---
  const connForm = document.getElementById('lg-connection-form');
  const statusDisplay = document.querySelector('#connection-status span');

  connForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(connForm));
    localStorage.setItem('lgconfigs', JSON.stringify(formData));

    const connected = await connectToLG();

    statusDisplay.textContent = connected ? "Connected" : "Disconnected";
    statusDisplay.style.color = connected ? "green" : "red";
  });

  // --- TOOLS BUTTONS ---
  document.getElementById('tools').addEventListener('click', e => {
    const action = e.target.dataset.action;
    if (action) {
      fetch(`/api/tools/${action}`, { method: 'POST' })
        .then(res => res.text())
        .then(msg => alert(msg))
        .catch(err => alert('Error: ' + err.message));
    }
  });

  // --- VISUALISATION FORM ---
  const vizForm = document.getElementById('visualisation-form');
  vizForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { eventName } = Object.fromEntries(new FormData(vizForm));

    try {
      const res = await fetch('/api/visualise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName })
      });

      const msg = await res.text();
      alert(msg);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  });
});
