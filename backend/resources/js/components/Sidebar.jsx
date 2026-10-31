import React from "react";
import { Link, usePage } from "@inertiajs/react";
import "../../css/sidebar.css";

export default function Sidebar() {
    const { url, props } = usePage();

    const user = props.auth?.user;
    const isSuperadmin = user?.role === "superadmin";

    const menuItems = [
        {
            section: "MAIN",
            items: [
                {
                    name: "Dashboard",
                    path: "/dashboard",
                },
            ],
        },
        {
            section: "MANAGEMENT",
            items: [
                {
                    name: "Products",
                    path: "/inventory/products",
                },
                {
                    name: "Categories",
                    path: "/inventory/categories",
                },
                {
                    name: "Suppliers",
                    path: "/inventory/suppliers",
                },
            ],
        },
        {
            section: "INVENTORY",
            items: [
                {
                    name: "Stock In",
                    path: "/inventory/stock-in",
                },
                {
                    name: "Stock Out",
                    path: "/inventory/stock-out",
                },
                {
                    name: "Stock History",
                    path: "/inventory/history",
                },
            ],
        },
        {
            section: "OPERATIONS",
            items: [
                {
                    name: "Point of Sale",
                    path: "/pos",
                },
                {
                    name: "Orders",
                    path: "/orders",
                },
                {
                    name: "Payments",
                    path: "/payments",
                },
                {
                    name: "Sales",
                    path: "/sales",
                },
            ],
        },
        {
            section: "REPORTS",
            items: [
                {
                    name: "Inventory Reports",
                    path: "/inventory/reports",
                },
                {
                    name: "Sales Reports",
                    path: "/sales/reports",
                },
                {
                    name: "Overall Analytics",
                    path: "/analytics",
                    superadminOnly: true,
                },
            ],
        },
        {
            section: "ADMINISTRATION",
            items: [
                {
                    name: "User Management",
                    path: "/users",
                    superadminOnly: true,
                },
                {
                    name: "Activity Logs",
                    path: "/activity-logs",
                    superadminOnly: true,
                },
                {
                    name: "System Settings",
                    path: "/settings",
                    superadminOnly: true,
                },
            ],
        },
    ];

    // Filter navigation based on user role.
    const visibleMenuItems = menuItems
        .map((group) => ({
            ...group,
            items: group.items.filter(
                (item) => !item.superadminOnly || isSuperadmin
            ),
        }))
        .filter((group) => group.items.length > 0);

    // Check active navigation.
    const isActive = (path) => {
        const currentPath = url.split("?")[0];

        return currentPath === path;
    };

    return (
        <aside className="sc-sidebar">

            {/* Sidebar Header */}
            <div className="sc-sidebar-header">

                <img
                    src="/images/school-logo.jpg"
                    alt="Carmen Denia National High School"
                    className="sc-sidebar-school-logo"
                />

                <div className="sc-sidebar-brand">
                    <h2>School Canteen</h2>
                    <p>Management System</p>
                </div>

            </div>

            {/* Sidebar Navigation */}
            <nav
                className="sc-sidebar-navigation"
                aria-label="Main navigation"
            >
                {visibleMenuItems.map((group) => (
                    <div
                        className="sc-sidebar-section"
                        key={group.section}
                    >
                        <p className="sc-sidebar-section-title">
                            {group.section}
                        </p>

                        {group.items.map((item) => {
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`sc-sidebar-link ${
                                        active ? "active" : ""
                                    }`}
                                    aria-current={
                                        active ? "page" : undefined
                                    }
                                >
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

        </aside>
    );
}