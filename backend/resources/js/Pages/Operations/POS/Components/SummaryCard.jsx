
import React from "react";

export default function SummaryCard({
    title,
    value,
    icon: Icon,
    type,
}) {
    return (
        <div className="pos-summary-card">
            <div className="pos-summary-card-top">
                <span className="pos-summary-card-label">
                    {title}
                </span>

                <div
                    className={`pos-summary-card-icon pos-summary-icon-${type}`}
                >
                    <Icon size={19} strokeWidth={1.8} />
                </div>
            </div>

            <div className="pos-summary-card-bottom">
                <h2 className="pos-summary-card-value">
                    {value}
                </h2>
            </div>
        </div>
    );
}
