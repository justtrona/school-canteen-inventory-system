import React, { useEffect, useRef, useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Sidebar from "../components/Sidebar.jsx";
import "../../css/inventory-layout.css";

export default function InventoryLayout({ children }) {
    const { props } = usePage();
    const user = props.auth?.user;

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const displayName = user?.name || "User";

    const roleLabel =
        user?.role === "superadmin"
            ? "Superadmin"
            : user?.role === "admin"
              ? "Administrator"
              : "Staff";

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
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleLogout = () => {
        setMenuOpen(false);
        router.post("/logout");
    };

    return (
        <div className="inventory-layout">
            <Sidebar />

            <div className="inventory-wrapper">
                <header className="inventory-header">
                    <div className="inventory-header-title">
                        Doña Carmen Denia National High School
                    </div>

                    <div
                        className="inventory-account"
                        ref={menuRef}
                    >
                        <button
                            type="button"
                            className={`inventory-account-trigger ${
                                menuOpen ? "is-open" : ""
                            }`}
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-expanded={menuOpen}
                            aria-haspopup="true"
                        >
                            <span className="inventory-account-avatar">
                                {initials}
                            </span>

                            <span className="inventory-account-details">
                                <span className="inventory-account-name">
                                    {displayName}
                                </span>

                                <span className="inventory-account-role">
                                    {roleLabel}
                                </span>
                            </span>

                            <svg
                                className={`inventory-account-chevron ${
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
                            <div className="inventory-account-dropdown">
                                <div className="inventory-dropdown-user">
                                    <strong>{displayName}</strong>
                                    <span>{user?.email || roleLabel}</span>
                                </div>

                                <div className="inventory-dropdown-actions">
                                    <button
                                        type="button"
                                        className="inventory-dropdown-item"
                                        disabled
                                        title="Profile page not available yet"
                                    >
                                        My Profile
                                        <span className="inventory-coming-soon">
                                            Soon
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        className="inventory-dropdown-item"
                                        disabled
                                        title="Account settings not available yet"
                                    >
                                        Account Settings
                                        <span className="inventory-coming-soon">
                                            Soon
                                        </span>
                                    </button>
                                </div>

                                <div className="inventory-dropdown-footer">
                                    <button
                                        type="button"
                                        className="inventory-dropdown-item inventory-logout"
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                <main className="inventory-content">
                    {children}
                </main>
            </div>
        </div>
    );
}