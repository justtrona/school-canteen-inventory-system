
import React from "react";
import { Link } from "@inertiajs/react";

import { ORDER_STATUSES } from "../Utils/constants.js";
import { formatNumber } from "../Utils/formatters.js";

export default function OrderStatusTabs({
    statusCounts = {},
    activeStatus = "all",
}) {
    return (
        <nav
            className="orders-status-tabs"
            aria-label="Filter orders by status"
        >
            {ORDER_STATUSES.map((status) => {
                const isActive = activeStatus === status.value;

                const href =
                    status.value === "all"
                        ? "/orders"
                        : `/orders?status=${status.value}`;

                return (
                    <Link
                        key={status.value}
                        href={href}
                        preserveScroll
                        preserveState
                        className={`orders-status-tab ${
                            isActive ? "active" : ""
                        }`}
                        aria-current={isActive ? "page" : undefined}
                    >
                        <span>{status.label}</span>

                        <span className="orders-status-tab-count">
                            {formatNumber(
                                statusCounts[status.value] ?? 0
                            )}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
