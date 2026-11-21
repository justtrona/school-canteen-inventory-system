
import React, { useMemo, useState } from "react";
import { Head } from "@inertiajs/react";
import CashierLayout from "../../../Layouts/CashierLayout.jsx";
import "../../../../css/cashier/pos.css";

const money = (value) =>
    Number(value || 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
    });

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

const formatStock = (value, unit = "pcs") =>
    Number(value || 0).toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });

export default function Index({
    products = [],
    categories = [],
}) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [cart, setCart] = useState([]);
    const [cashReceived, setCashReceived] = useState("");
    const [message, setMessage] = useState("");

    const availableProducts = useMemo(() => {
        return products.filter((product) => {
            const name = String(product.name || "").toLowerCase();
            const sku = String(product.sku || "").toLowerCase();
            const query = search.trim().toLowerCase();

            const matchesSearch =
                name.includes(query) || sku.includes(query);

            const matchesCategory =
                category === "all" ||
                String(product.category_id) === category;

            return matchesSearch && matchesCategory;
        });
    }, [products, search, category]);

    const cartCount = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const subtotalCents = cart.reduce(
        (sum, item) =>
            sum +
            Math.round(Number(item.price) * 100) * item.quantity,
        0
    );

    const total = subtotalCents / 100;

    const cashCents =
        cashReceived.trim() === ""
            ? 0
            : Math.round(Number(cashReceived) * 100);

    const cashValid =
        cashReceived.trim() !== "" &&
        Number.isFinite(Number(cashReceived)) &&
        Number(cashReceived) >= 0;

    const change =
        cashValid && cashCents >= subtotalCents
            ? (cashCents - subtotalCents) / 100
            : 0;

    const addToCart = (product) => {
        setMessage("");

        const stock = Number(product.quantity || 0);
        const unit = product.unit_of_measure || "pcs";

        if (stock < 1) {
            setMessage("This product is out of stock.");
            return;
        }

        const existing = cart.find(
            (item) => item.id === product.id
        );

        if (existing && existing.quantity + 1 > stock) {
            setMessage(
                `Only ${formatStock(stock, unit)} ${unit} available.`
            );
            return;
        }

        if (existing) {
            setCart((previous) =>
                previous.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              quantity: item.quantity + 1,
                          }
                        : item
                )
            );
        } else {
            setCart((previous) => [
                ...previous,
                {
                    id: product.id,
                    name: product.name,
                    sku: product.sku,
                    price: Number(product.price || 0),
                    stock,
                    unit,
                    quantity: 1,
                },
            ]);
        }
    };

    const updateQuantity = (id, difference) => {
        setMessage("");

        setCart((previous) =>
            previous
                .map((item) => {
                    if (item.id !== id) return item;

                    const quantity = item.quantity + difference;

                    if (quantity > item.stock) {
                        setMessage(
                            `Only ${formatStock(item.stock, item.unit)} ${item.unit} available.`
                        );
                        return item;
                    }

                    return { ...item, quantity };
                })
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (id) => {
        setCart((previous) =>
            previous.filter((item) => item.id !== id)
        );
        setMessage("");
    };

    const clearCart = () => {
        setCart([]);
        setCashReceived("");
        setMessage("");
    };

    const canCheckout =
        cart.length > 0 &&
        cashValid &&
        cashCents >= subtotalCents;

    return (
        <CashierLayout>
            <Head title="Cashier - Point of Sale" />

            <div className="cashier-pos-page">
                <div className="cashier-pos-heading">
                    <div>
                        <h1>Point of Sale</h1>
                        <p>
                            Select products, manage the order,
                            and process customer payments.
                        </p>
                    </div>

                    <div className="cashier-pos-date">
                        {new Date().toLocaleDateString("en-PH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </div>
                </div>

                <div className="cashier-pos-grid">
                    <section className="cashier-pos-products">
                        <div className="cashier-pos-panel-header">
                            <div>
                                <h2>Products</h2>
                                <span>
                                    {availableProducts.length} products
                                </span>
                            </div>
                        </div>

                        <div className="cashier-pos-filters">
                            <div className="cashier-pos-search">
                                <svg
                                    width="19"
                                    height="19"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m20 20-4-4" />
                                </svg>

                                <input
                                    type="search"
                                    placeholder="Search product name or SKU..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>

                            <select
                                value={category}
                                onChange={(event) =>
                                    setCategory(event.target.value)
                                }
                                aria-label="Filter products by category"
                            >
                                <option value="all">
                                    All Categories
                                </option>

                                {categories.map((item) => (
                                    <option
                                        key={item.id}
                                        value={String(item.id)}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="cashier-pos-product-grid">
                            {availableProducts.length > 0 ? (
                                availableProducts.map((product) => {
                                    const stock = Number(
                                        product.quantity || 0
                                    );

                                    const unit =
                                        product.unit_of_measure || "pcs";

                                    const inCart =
                                        cart.find(
                                            (item) =>
                                                item.id === product.id
                                        )?.quantity || 0;

                                    const remaining = stock - inCart;
                                    const outOfStock = remaining < 1;

                                    return (
                                        <button
                                            type="button"
                                            key={product.id}
                                            className={`cashier-pos-product-card ${
                                                outOfStock
                                                    ? "is-unavailable"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                addToCart(product)
                                            }
                                            disabled={outOfStock}
                                        >
                                            <div className="cashier-pos-product-icon">
                                                <svg
                                                    width="30"
                                                    height="30"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="m3 7 9-4 9 4-9 4-9-4Z" />
                                                    <path d="M3 7v10l9 4 9-4V7" />
                                                    <path d="M12 11v10" />
                                                </svg>
                                            </div>

                                            <span className="cashier-pos-product-name">
                                                {product.name}
                                            </span>

                                            <span className="cashier-pos-product-sku">
                                                {product.sku}
                                            </span>

                                            <strong className="cashier-pos-product-price">
                                                {money(product.price)}
                                            </strong>

                                            <span
                                                className={`cashier-pos-stock ${
                                                    outOfStock ? "out" : ""
                                                }`}
                                            >
                                                {outOfStock
                                                    ? "Out of stock"
                                                    : `${formatStock(remaining, unit)} ${unit} available`}
                                            </span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="cashier-pos-empty-products">
                                    No products found.
                                </div>
                            )}
                        </div>
                    </section>

                    <aside className="cashier-pos-cart">
                        <div className="cashier-pos-cart-header">
                            <div>
                                <h2>Current Order</h2>
                                <span>
                                    {cartCount} item
                                    {cartCount !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="cashier-pos-clear"
                                onClick={clearCart}
                                disabled={cart.length === 0}
                            >
                                Clear
                            </button>
                        </div>

                        <div className="cashier-pos-cart-items">
                            {cart.length === 0 ? (
                                <div className="cashier-pos-empty-cart">
                                    <div className="cashier-pos-empty-icon">
                                        <svg
                                            width="36"
                                            height="36"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="9" cy="21" r="1" />
                                            <circle cx="20" cy="21" r="1" />
                                            <path d="M1 1h4l2.5 13h12l2-9H6" />
                                        </svg>
                                    </div>

                                    <strong>Your cart is empty</strong>
                                    <p>
                                        Select a product to add it
                                        to the current order.
                                    </p>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="cashier-pos-cart-item"
                                    >
                                        <div className="cashier-pos-cart-item-info">
                                            <strong>{item.name}</strong>
                                            <span>
                                                {money(item.price)} each
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="cashier-pos-remove"
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                            aria-label={`Remove ${item.name}`}
                                        >
                                            ×
                                        </button>

                                        <div className="cashier-pos-cart-item-bottom">
                                            <div className="cashier-pos-quantity">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            -1
                                                        )
                                                    }
                                                    aria-label={`Decrease ${item.name}`}
                                                >
                                                    −
                                                </button>

                                                <span>{item.quantity}</span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.id,
                                                            1
                                                        )
                                                    }
                                                    disabled={
                                                        item.quantity >=
                                                        item.stock
                                                    }
                                                    aria-label={`Increase ${item.name}`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <strong>
                                                {money(
                                                    item.price * item.quantity
                                                )}
                                            </strong>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="cashier-pos-checkout">
                            <div className="cashier-pos-total-row">
                                <span>Subtotal</span>
                                <strong>{money(total)}</strong>
                            </div>

                            <div className="cashier-pos-grand-total">
                                <span>Total</span>
                                <strong>{money(total)}</strong>
                            </div>

                            <div className="cashier-pos-payment">
                                <label htmlFor="cashier-cash-received">
                                    Cash Received
                                </label>

                                <div className="cashier-pos-cash-input">
                                    <span>₱</span>

                                    <input
                                        id="cashier-cash-received"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={cashReceived}
                                        onChange={(event) =>
                                            setCashReceived(
                                                event.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="cashier-pos-change">
                                <span>Change</span>
                                <strong>{money(change)}</strong>
                            </div>

                            {message && (
                                <p
                                    className="cashier-pos-message"
                                    role="alert"
                                >
                                    {message}
                                </p>
                            )}

                            <button
                                type="button"
                                className="cashier-pos-checkout-button"
                                disabled
                                title="Checkout will be enabled after backend integration"
                            >
                                Complete Sale
                            </button>

                            {canCheckout && (
                                <p className="cashier-pos-ready">
                                    Payment amount is sufficient.
                                    Checkout integration is pending.
                                </p>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </CashierLayout>
    );
}
