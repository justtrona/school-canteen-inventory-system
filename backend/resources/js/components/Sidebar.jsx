
import React from "react";
import { Link, usePage } from "@inertiajs/react";

import {
    LayoutDashboard,
    Package,
    Tags,
    Truck,
    PackagePlus,
    PackageMinus,
    History,
    ShoppingCart,
    ClipboardList,
    CreditCard,
    ChartNoAxesColumnIncreasing,
    Boxes,
    ChartPie,
    ChartNoAxesCombined,
    Users,
    ScrollText,
    Settings,
} from "lucide-react";

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
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            section: "MANAGEMENT",
            items: [
                {
                    name: "Products",
                    path: "/inventory/products",
                    icon: Package,
                },
                {
                    name: "Categories",
                    path: "/inventory/categories",
                    icon: Tags,
                },
                {
                    name: "Suppliers",
                    path: "/inventory/suppliers",
                    icon: Truck,
                },
            ],
        },
        {
            section: "INVENTORY",
            items: [
                {
                    name: "Stock In",
                    path: "/inventory/stock-in",
                    icon: PackagePlus,
                },
                {
                    name: "Stock Out",
                    path: "/inventory/stock-out",
                    icon: PackageMinus,
                },
                {
                    name: "Stock History",
                    path: "/inventory/history",
                    icon: History,
                },
            ],
        },
        {
            section: "OPERATIONS",
            items: [
                {
                    name: "Point of Sale",
                    path: "/pos",
                    icon: ShoppingCart,
                },
                {
                    name: "Orders",
                    path: "/orders",
                    icon: ClipboardList,
                },
                {
                    name: "Payments",
                    path: "/payments",
                    icon: CreditCard,
                },
                {
                    name: "Sales",
                    path: "/sales",
                    icon: ChartNoAxesColumnIncreasing,
                },
            ],
        },
        {
            section: "REPORTS",
            items: [
                {
                    name: "Inventory Reports",
                    path: "/inventory/reports",
                    icon: Boxes,
                },
                {
                    name: "Sales Reports",
                    path: "/sales/reports",
                    icon: ChartPie,
                },
                {
                    name: "Overall Analytics",
                    path: "/analytics",
                    icon: ChartNoAxesCombined,
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
                    icon: Users,
                    superadminOnly: true,
                },
                {
                    name: "Activity Logs",
                    path: "/activity-logs",
                    icon: ScrollText,
                    superadminOnly: true,
                },
                {
                    name: "System Settings",
                    path: "/settings",
                    icon: Settings,
                    superadminOnly: true,
                },
            ],
        },
    ];

    const visibleMenuItems = menuItems
        .map((group) => ({
            ...group,
            items: group.items.filter(
                (item) => !item.superadminOnly || isSuperadmin
            ),
        }))
        .filter((group) => group.items.length > 0);

    const isActive = (path) => {
        const currentPath = url.split("?")[0];

        return currentPath === path;
    };

    return (
        <aside className="sc-sidebar">
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
                            const Icon = item.icon;

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
                                    <Icon
                                        size={17}
                                        strokeWidth={1.8}
                                        className="sc-sidebar-icon"
                                        aria-hidden="true"
                                    />

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
