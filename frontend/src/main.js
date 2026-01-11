import { API_BASE_URL } from "./config/api";

const apiBase = API_BASE_URL;

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
