import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "5s", target: 20 }, // simulate ramp-up of traffic from 1 to 20 users over 5 seconds.
    { duration: "10s", target: 20 }, // stay at 20 users for 10 seconds
    { duration: "5s", target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests must complete below 500ms
  },
};

const API_URL = "http://host.docker.internal:5000"; // Using host.docker.internal since we will run k6 via docker

export function setup() {
  const loginRes = http.post(
    `${API_URL}/api/auth/login`,
    JSON.stringify({
      email: "admin@alamine.com",
      password: "Password123!",
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  let token = null;
  if (loginRes.status === 200) {
    try {
      token = loginRes.json("data.token");
    } catch (e) {}
  }

  return { token };
}

export default function (data) {
  // 1. Test Catalog endpoint (public)
  const catalogRes = http.get(`${API_URL}/api/products`);
  check(catalogRes, {
    "catalog is status 200": (r) => r.status === 200,
  });

  // 2. Test Dashboard Stats (requires admin token)
  if (data.token) {
    const params = {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    };

    const statsRes = http.get(`${API_URL}/api/dashboard/stats`, params);
    check(statsRes, {
      "dashboard stats is status 200": (r) => r.status === 200,
    });

    const trendsRes = http.get(`${API_URL}/api/dashboard/trends`, params);
    check(trendsRes, {
      "dashboard trends is status 200": (r) => r.status === 200,
    });
  }

  sleep(1);
}
