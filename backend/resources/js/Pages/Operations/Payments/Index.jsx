
import React from "react";
import { Head } from "@inertiajs/react";

import Sidebar from "../../../components/Sidebar";

import SummaryCards from "./Components/SummaryCards.jsx";
import PaymentsTable from "./Components/PaymentsTable.jsx";

import usePaymentFilters from "./Hooks/usePaymentFilters.js";

import "../../../../css/payments.css";

export default function Index({
    summary = {},
    payments = {},
    filters = {},
}) {
    const filterControls = usePaymentFilters(filters);

    return (
        <>
            <Head title="Payment Management" />

            <div className="payments-layout">
                <Sidebar />

                <main className="payments-main">
                    <div className="payments-page-header">
                        <div>
                            <h1>Payment Management</h1>
                            <p>
                                Monitor and review canteen
                                payment transactions.
                            </p>
                        </div>
                    </div>

                    <SummaryCards summary={summary} />

                    <PaymentsTable
                        payments={payments}
                        filterControls={filterControls}
                    />
                </main>
            </div>
        </>
    );
}
