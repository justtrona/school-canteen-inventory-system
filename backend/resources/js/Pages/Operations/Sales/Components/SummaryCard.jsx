
import React from "react";

export default function SummaryCard({
    label,
    value,
    icon: Icon,
    color,
}) {
    return (
        <div className="sales-summary-card">
            <div className="sales-summary-card-top">
                <span>{label}</span>

                <div
                    className={`sales-summary-icon sales-summary-${color}`}
                >
                    <Icon
                        size={20}
                        strokeWidth={1.8}
                    />
                </div>
            </div>

            <h2>{value}</h2>
        </div>
    );
}
