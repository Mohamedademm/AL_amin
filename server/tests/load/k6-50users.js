import http from "k6/http";
import { check, sleep } from "k6";

// This configures the test to run with exactly 50 concurrent users
export const options = {
  vus: 50, // 50 virtual users at the same time
  duration: "30s", // run the test for 30 seconds
};

// We use host.docker.internal to access the backend running on the host machine from inside the docker container
const API_URL = "http://host.docker.internal:5000";

export default function () {
  // --- 1. Simulate user visiting the Home / Catalog page ---
  const catalogRes = http.get(`${API_URL}/api/products`);

  // 3. Show how to check if the server is responding with a successful status (200 OK)
  check(catalogRes, {
    "Catalog page loaded successfully (200 OK)": (r) => r.status === 200,
  });

  // 2. Wait 1 or 2 seconds before making another request (randomized between 1 and 2)
  sleep(Math.random() * (2 - 1) + 1);

  // --- Simulate user visiting categories ---
  const categoryRes = http.get(`${API_URL}/api/categories`);
  check(categoryRes, {
    "Categories loaded successfully (200 OK)": (r) => r.status === 200,
  });

  // Wait again like a real human
  sleep(Math.random() * (2 - 1) + 1);
}
