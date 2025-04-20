const ENDPOINT_CLEAN_BALLOON = "/api/lg-connection/clean-balloon";

export const cleanballoon = async () => {
  try {
    const configs = JSON.parse(localStorage.getItem("lgconfigs"));
    const { server, username, ip, port, password, screens } = configs;

    const response = await fetch(server + ENDPOINT_CLEAN_BALLOON, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, ip, port, password, screens }),
    });

    if (!response.ok) throw new Error("Failed to clean balloon.");

    const data = await response.json();
    console.log("Balloon cleaned:", data);
    alert("Balloon cleanup successful!");
  } catch (error) {
    console.error("Balloon cleanup error:", error);
    alert("Failed to clean balloon. Check console for details.");
  }
};
