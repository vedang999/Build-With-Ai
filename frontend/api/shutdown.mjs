const ENDPOINT_SHUTDOWN = "/api/lg-connection/shutdown-lg";

export const shutdown = async () => {
  try {
    const configs = JSON.parse(localStorage.getItem("lgconfigs"));
    const { server, username, ip, port, password, screens } = configs;

    const response = await fetch(server + ENDPOINT_SHUTDOWN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, ip, port, password, screens }),
    });

    const result = await response.json();
    console.log("Shutdown:", result.message || result.error);
  } catch (error) {
    console.error("Shutdown Error:", error);
  }
};
