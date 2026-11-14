
import React from "react";

export default function SummaryCard({
    label,
    value,
    icon: Icon,
    color,
}) {
    return (
        <div className="payments-summary-card">
            <div className="payments-summary-card-top">
                <span>{label}</span>

                <div
                    className={`payments-summary-icon payments-summary-${color}`}
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
