import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://localhost:5000/api/products", () => {
    return HttpResponse.json({
      status: "OK",
      data: [
        {
          id: "p1",
          name: "Mocked Product",
          price: 1500,
          description: "This is a mocked product from MSW",
          imageUrl: "/mock-img.jpg",
        },
      ],
    });
  }),

  http.post("http://localhost:5000/api/auth/login", async ({ request }) => {
    const info = (await request.json()) as any;
    if (
      info.email === "client@alamine.com" &&
      info.password === "Password123!"
    ) {
      return HttpResponse.json({
        status: "OK",
        data: {
          token: "fake-jwt-token",
          user: { id: "u1", firstName: "Test", role: "CLIENT" },
        },
      });
    }
    return new HttpResponse(null, { status: 401 });
  }),
];
