import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { Input } from "./Input";

describe("Input Component", () => {
  it("renders input with label correctly", () => {
    render(
      <Input label="Username" id="username" placeholder="Enter username" />,
    );

    const label = screen.getByText("Username");
    expect(label).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Enter username");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "username");
  });

  it("renders input without label", () => {
    render(<Input placeholder="No label input" />);

    const input = screen.getByPlaceholderText("No label input");
    expect(input).toBeInTheDocument();
  });

  it("handles value changes", () => {
    const handleChange = vi.fn();
    render(<Input label="Email" id="email" onChange={handleChange} />);

    const input = screen.getByLabelText("Email");
    fireEvent.change(input, { target: { value: "test@example.com" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("displays error message and applies error styles", () => {
    render(
      <Input label="Password" id="password" error="Password is required" />,
    );

    const errorText = screen.getByText("Password is required");
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass("text-red-500");

    const input = screen.getByLabelText("Password");
    expect(input).toHaveClass("border-red-500");
  });

  it("forwards refs correctly", () => {
    let refValue: HTMLInputElement | null = null;
    render(
      <Input label="Ref Test" id="ref-test" ref={(el) => (refValue = el)} />,
    );

    const input = screen.getByLabelText("Ref Test");
    expect(refValue).toBe(input);
  });
});
