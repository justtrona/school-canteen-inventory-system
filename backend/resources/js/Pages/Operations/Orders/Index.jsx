
import React from "react";
import { Head } from "@inertiajs/react";

import Sidebar from "../../../components/Sidebar";
import SummaryCards from "./Components/SummaryCards.jsx";
import OrdersTable from "./Components/OrdersTable.jsx";

import "../../../../css/orders.css";

export default function Index({
    orders = {},
    statusCounts = {},
    filters = {},
}) {
    return (
        <>
            <Head title="Order Management" />

            <div className="orders-layout">
                <Sidebar />

                <main className="orders-main">
                    <div className="orders-page-header">
                        <div>
                            <h1>Order Management</h1>
                            <p>
                                Monitor and manage canteen
                                orders and their statuses.
                            </p>
                        </div>
                    </div>

                    <div className="orders-content">
                        <SummaryCards
                            statusCounts={statusCounts}
                        />

                        <OrdersTable
                            orders={orders}
                            filters={filters}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
