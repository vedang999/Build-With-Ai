const ENDPOINT_REBOOT = "/api/lg-connection/reboot-lg";

export const reboot = async () => {
  try {
    const configs = JSON.parse(localStorage.getItem("lgconfigs"));
    const { server, username, ip, port, password, screens } = configs;

    const response = await fetch(server + ENDPOINT_REBOOT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, ip, port, password, screens }),
    });

    const result = await response.json();
    console.log("Reboot:", result.message || result.error);
  } catch (error) {
    console.error("Reboot Error:", error);
  }
};
