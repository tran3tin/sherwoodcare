const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function fetchSample() {
  try {
    const res = await fetch(`${apiBase}/api/sample`);
    const json = await res.json();
    document.getElementById("data").textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    document.getElementById("data").textContent =
      "Error fetching data: " + err.message;
  }
}

fetchSample();
