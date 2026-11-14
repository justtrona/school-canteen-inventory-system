
import React from "react";
import { Search, X } from "lucide-react";

export default function TransactionSearch({
    search,
    setSearch,
    handleSearch,
    clearSearch,
}) {
    return (
        <form
            className="pos-search-form"
            onSubmit={handleSearch}
            role="search"
        >
            <div className="pos-search-control">
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
                    placeholder="Search transaction number..."
                    aria-label="Search transaction number"
                />

                {search !== "" && (
                    <button
                        type="button"
                        className="pos-search-clear"
                        onClick={clearSearch}
                        aria-label="Clear search"
                    >
                        <X size={15} />
                    </button>
                )}
            </div>

            <button
                type="submit"
                className="pos-search-button"
            >
                Search
            </button>
        </form>
    );
}
