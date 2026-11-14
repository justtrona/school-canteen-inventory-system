
import React from "react";
import { Search, X } from "lucide-react";

export default function OrderSearch({
    search,
    setSearch,
    handleSearch,
    clearSearch,
}) {
    return (
        <form
            className="orders-search-form"
            onSubmit={handleSearch}
            role="search"
        >
            <div className="orders-search-control">
                <Search
                    size={17}
                    strokeWidth={1.8}
                    aria-hidden="true"
                />

                <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    placeholder="Search order number..."
                    aria-label="Search order number"
                />

                {search !== "" && (
                    <button
                        type="button"
                        className="orders-search-clear"
                        onClick={clearSearch}
                        aria-label="Clear search"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            <button
                type="submit"
                className="orders-search-button"
            >
                Search
            </button>
        </form>
    );
}
