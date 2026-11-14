
import React from "react";

export default function SummaryCard({
    label,
    value,
    icon: Icon,
    iconClass,
}) {
    return (
        <div className="orders-summary-card">
            <div className="orders-summary-card-top">
                <span className="orders-summary-card-label">
                    {label}
                </span>

                <div
                    className={`orders-summary-card-icon ${iconClass}`}
                >
                    <Icon size={20} strokeWidth={1.8} />
                </div>
            </div>

            <div className="orders-summary-card-bottom">
                <h2 className="orders-summary-card-value">
                    {value}
                </h2>
            </div>
        </div>
    );
}
