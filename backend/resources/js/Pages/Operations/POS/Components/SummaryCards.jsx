
import React from "react";

import {
    Wallet,
    ReceiptText,
    ChartNoAxesColumnIncreasing,
    Ban,
} from "lucide-react";

import SummaryCard from "./SummaryCard.jsx";
import { formatCurrency, formatNumber } from "../Utils/formatters.js";

export default function SummaryCards({ summary = {} }) {
    const {
        totalSales = 0,
        completedTransactions = 0,
        averageTransaction = 0,
        voidedTransactions = 0,
    } = summary;

    const cards = [
        {
            title: "Today's POS Sales",
            value: formatCurrency(totalSales),
            icon: Wallet,
            type: "sales",
        },
        {
            title: "Completed Transactions",
            value: formatNumber(completedTransactions),
            icon: ReceiptText,
            type: "transactions",
        },
        {
            title: "Average Transaction",
            value: formatCurrency(averageTransaction),
            icon: ChartNoAxesColumnIncreasing,
            type: "average",
        },
        {
            title: "Voided Transactions",
            value: formatNumber(voidedTransactions),
            icon: Ban,
            type: "voided",
        },
    ];

    return (
        <div className="pos-summary-grid">
            {cards.map((card) => (
                <SummaryCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    type={card.type}
                />
            ))}
        </div>
    );
}
