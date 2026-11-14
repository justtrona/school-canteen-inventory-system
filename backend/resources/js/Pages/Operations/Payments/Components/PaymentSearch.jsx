
import React from "react";
import { Search } from "lucide-react";

export default function PaymentSearch({
    search,
    setSearch,
    onSubmit,
}) {
    return (
        <form
            className="payments-search-form"
            onSubmit={onSubmit}
        >
            <div className="payments-search-control">
                <Search size={16} strokeWidth={1.8} />

                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search order or reference number..."
                    aria-label="Search payments"
                />
            </div>

            <button
                type="submit"
                className="payments-search-button"
            >
                Search
            </button>
        </form>
    );
}
