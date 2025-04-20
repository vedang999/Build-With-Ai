const ENDPOINT_CLEAN_KML = "/api/lg-connection/clean-visualization";

export const cleankml = async () => {
  try {
    const configs = JSON.parse(localStorage.getItem("lgconfigs"));
    const { server, username, ip, port, password, screens } = configs;

    const response = await fetch(server + ENDPOINT_CLEAN_KML, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, ip, port, password, screens }),
    });

    const result = await response.json();
    console.log("Clean KML:", result.message || result.error);
  } catch (error) {
    console.error("Clean KML Error:", error);
  }
};
