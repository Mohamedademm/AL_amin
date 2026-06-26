import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "./ProductCard";
import * as CartContext from "../../context/CartContext";

describe("ProductCard", () => {
  const mockProduct = {
    id: "123",
    name: "Test Product",
    description: "This is a test product",
    price: 100,
    imageUrl: "/test.jpg",
    category: { id: "cat1", name: "Test Category" },
  };

  const mockProductWithDiscount = {
    ...mockProduct,
    discountPercent: 20,
    discountedPrice: 80,
  };

  const mockAdd = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(CartContext, "useCart").mockReturnValue({
      add: mockAdd,
      items: [],
      remove: vi.fn(),
      updateQuantity: vi.fn(),
      clear: vi.fn(),
      totalItems: 0,
      totalPrice: 0,
      isCartOpen: false,
      setIsCartOpen: vi.fn(),
    });
  });

  it("renders product details correctly", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("This is a test product")).toBeInTheDocument();
    expect(screen.getByText("Test Category")).toBeInTheDocument();
  });

  it("renders original and discounted prices when product has discount", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProductWithDiscount} />
      </MemoryRouter>,
    );

    expect(screen.getByText("−20%")).toBeInTheDocument();
  });

  it("calls add to cart when the add button is clicked", () => {
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct} />
      </MemoryRouter>,
    );

    const addButton = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(addButton);

    expect(mockAdd).toHaveBeenCalledWith(mockProduct, 1);
  });
});
