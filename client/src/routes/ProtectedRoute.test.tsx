import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
};

const renderWithRouter = (
  ui: React.ReactNode,
  initialEntries = ["/protected"],
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/protected" element={ui} />
      </Routes>
      <LocationDisplay />
    </MemoryRouter>,
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loader when authenticating", () => {
    (useAuth as any).mockReturnValue({ loading: true, user: null });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Authenticating")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects to /login if user is not authenticated", () => {
    (useAuth as any).mockReturnValue({ loading: false, user: null });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("location-display")).toHaveTextContent("/login");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders children if authenticated and no roles specified", () => {
    (useAuth as any).mockReturnValue({
      loading: false,
      user: { id: "1", role: "CLIENT" },
    });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("renders children if user role is in allowedRoles", () => {
    (useAuth as any).mockReturnValue({
      loading: false,
      user: { id: "1", role: "ADMIN" },
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
        <div>Admin Panel</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("redirects to / if user role is not in allowedRoles", () => {
    (useAuth as any).mockReturnValue({
      loading: false,
      user: { id: "1", role: "CLIENT" },
    });

    renderWithRouter(
      <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
        <div>Admin Panel</div>
      </ProtectedRoute>,
    );

    expect(screen.getByTestId("location-display")).toHaveTextContent("/");
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });
});
