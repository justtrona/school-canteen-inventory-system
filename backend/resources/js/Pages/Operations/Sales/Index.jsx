
import React from "react";
import { Head } from "@inertiajs/react";

import Sidebar from "../../../components/Sidebar";

import SummaryCards from "./Components/SummaryCards.jsx";
import SalesTable from "./Components/SalesTable.jsx";

import useSalesFilters from "./Hooks/useSalesFilters.js";

import "../../../../css/sales.css";

export default function Index({
    summary = {},
    sales = {},
    filters = {},
}) {
    const filterControls = useSalesFilters(filters);

    return (
        <>
            <Head title="Sales Management" />

            <div className="sales-layout">
                <Sidebar />

                <main className="sales-main">
                    <div className="sales-page-header">
                        <div>
                            <h1>Sales Management</h1>
                            <p>
                                Monitor canteen sales
                                and transaction performance.
                            </p>
                        </div>
                    </div>

                    <div className="sales-content">
                        <SummaryCards summary={summary} />

                        <SalesTable
                            sales={sales}
                            filterControls={filterControls}
                        />
                    </div>
                </main>
            </div>
        </>
    );
}
