const ENDPOINT_CLEAN_LOGO = "/api/lg-connection/clean-logos";

export const cleanlogo = async () => {
  try {
    const configs = JSON.parse(localStorage.getItem("lgconfigs"));
    const { server, username, ip, port, password, screens } = configs;

    const response = await fetch(server + ENDPOINT_CLEAN_LOGO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, ip, port, password, screens }),
    });

    const result = await response.json();
    console.log("Clean Logo:", result.message || result.error);
  } catch (error) {
    console.error("Clean Logo Error:", error);
  }
};
