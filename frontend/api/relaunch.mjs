const ENDPOINT_RELAUNCH = "/api/lg-connection/relaunch-lg";

export const relaunch = async () => {
  try {
    const configs = JSON.parse(localStorage.getItem("lgconfigs"));
    const { server, username, ip, port, password, screens } = configs;

    const response = await fetch(server + ENDPOINT_RELAUNCH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, ip, port, password, screens }),
    });

    const result = await response.json();
    console.log("Relaunch:", result.message || result.error);
  } catch (error) {
    console.error("Relaunch Error:", error);
  }
};
