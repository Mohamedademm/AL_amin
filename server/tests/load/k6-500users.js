import http from "k6/http";
import { check, sleep } from "k6";

// This configures the test to run with exactly 500 concurrent users
export const options = {
  stages: [
    { duration: "10s", target: 500 }, // Ramp-up to 500 users over 10s
    { duration: "30s", target: 500 }, // Stay at 500 users for 30s
    { duration: "10s", target: 0 }, // Ramp-down to 0 users over 10s
  ],
};

const API_URL = "http://host.docker.internal:5000";

export default function () {
  // Simulate user visiting the Catalog page
  const catalogRes = http.get(`${API_URL}/api/products`);

  check(catalogRes, {
    "Catalog page loaded successfully (200 OK)": (r) => r.status === 200,
  });

  // Wait 1 to 2 seconds
  sleep(Math.random() * (2 - 1) + 1);

  // Simulate user visiting categories
  const categoryRes = http.get(`${API_URL}/api/categories`);
  check(categoryRes, {
    "Categories loaded successfully (200 OK)": (r) => r.status === 200,
  });

  // Wait again
  sleep(Math.random() * (2 - 1) + 1);
}
