
import React from "react";
import { Head } from "@inertiajs/react";

import Sidebar from "../../../components/Sidebar";
import SummaryCards from "./Components/SummaryCards.jsx";
import TransactionsTable from "./Components/TransactionsTable.jsx";

import "../../../../css/pos.css";

export default function Index({
    summary = {},
    transactions = {},
    filters = {},
}) {
    return (
        <>
            <Head title="Point of Sale" />

            <div className="pos-layout">
                <Sidebar />

                <main className="pos-main">
                    <div className="pos-page-header">
                        <div>
                            <h1>Point of Sale</h1>
                            <p>
                                Monitor and manage canteen
                                point-of-sale operations.
                            </p>
                        </div>

                        <div className="pos-period-label">
                            Today
                        </div>
                    </div>

                    <div className="pos-content">
                        <SummaryCards summary={summary} />

                        <TransactionsTable
                            transactions={transactions}
                            filters={filters}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
