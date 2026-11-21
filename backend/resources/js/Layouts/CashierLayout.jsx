
import React, { useEffect, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import "../../css/cashier/layout.css";

const navigation = [
    {
        label: "Dashboard",
        href: "/cashier/dashboard",
        icon: "dashboard",
    },
    {
        label: "Point of Sale",
        href: "/cashier/pos",
        icon: "pos",
    },
    {
        label: "Orders",
        href: "/cashier/orders",
        icon: "orders",
    },
];

function NavigationIcon({ name }) {
    const paths = {
        dashboard: (
            <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
            </>
        ),
        pos: (
            <>
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <path d="M3 9h18M8 14h3M8 17h5" />
            </>
        ),
        orders: (
            <>
                <path d="M8 4h8M8 2h8v4H8z" />
                <path d="M6 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1" />
                <path d="M8 12h8M8 16h8" />
            </>
        ),
    };

    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}

export default function CashierLayout({ children }) {
    const { props, url } = usePage();
    const user = props.auth?.user;

    const [menuOpen, setMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuRef = useRef(null);

    const displayName = user?.name || "Cashier";

    const initials = displayName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setMenuOpen(false);
                setSidebarOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    useEffect(() => {
        setSidebarOpen(false);
        setMenuOpen(false);
    }, [url]);

    const handleLogout = () => {
        setMenuOpen(false);
        router.post("/logout");
    };

    const isActive = (href) =>
        url.split("?")[0] === href ||
        url.split("?")[0].startsWith(`${href}/`);

    return (
        <div className="cashier-layout">
            {sidebarOpen && (
                <button
                    type="button"
                    className="cashier-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close navigation"
                />
            )}

            <aside
                className={`cashier-sidebar ${
                    sidebarOpen ? "is-open" : ""
                }`}
            >
                <div className="cashier-sidebar-brand">
                    <div className="cashier-brand-icon">
                        <NavigationIcon name="pos" />
                    </div>

                    <div className="cashier-brand-text">
                        <strong>School Canteen</strong>
                        <span>Cashier System</span>
                    </div>
                </div>

                <div className="cashier-sidebar-section">
                    <span className="cashier-sidebar-label">
                        CASHIER MENU
                    </span>

                    <nav
                        className="cashier-sidebar-nav"
                        aria-label="Cashier navigation"
                    >
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`cashier-nav-link ${
                                    isActive(item.href)
                                        ? "active"
                                        : ""
                                }`}
                                aria-current={
                                    isActive(item.href)
                                        ? "page"
                                        : undefined
                                }
                            >
                                <NavigationIcon name={item.icon} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="cashier-sidebar-footer">
                    <span>Doña Carmen Denia NHS</span>
                    <small>Point of Sale System</small>
                </div>
            </aside>

            <div className="cashier-wrapper">
                <header className="cashier-header">
                    <div className="cashier-header-left">
                        <button
                            type="button"
                            className="cashier-menu-toggle"
                            onClick={() =>
                                setSidebarOpen(!sidebarOpen)
                            }
                            aria-label="Toggle navigation"
                            aria-expanded={sidebarOpen}
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            >
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="cashier-header-title">
                            Doña Carmen Denia National High School
                        </div>
                    </div>

                    <div
                        className="cashier-account"
                        ref={menuRef}
                    >
                        <button
                            type="button"
                            className={`cashier-account-trigger ${
                                menuOpen ? "is-open" : ""
                            }`}
                            onClick={() =>
                                setMenuOpen(!menuOpen)
                            }
                            aria-expanded={menuOpen}
                            aria-haspopup="true"
                        >
                            <span className="cashier-account-avatar">
                                {initials}
                            </span>

                            <span className="cashier-account-details">
                                <span className="cashier-account-name">
                                    {displayName}
                                </span>

                                <span className="cashier-account-role">
                                    Cashier
                                </span>
                            </span>

                            <svg
                                className={`cashier-account-chevron ${
                                    menuOpen ? "rotated" : ""
                                }`}
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>

                        {menuOpen && (
                            <div className="cashier-account-dropdown">
                                <div className="cashier-dropdown-user">
                                    <strong>{displayName}</strong>
                                    <span>
                                        {user?.email || "Cashier"}
                                    </span>
                                </div>

                                <div className="cashier-dropdown-footer">
                                    <button
                                        type="button"
                                        className="cashier-logout"
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="cashier-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
