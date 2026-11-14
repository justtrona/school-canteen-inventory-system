
import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TransactionPagination({ transactions }) {
    const links = transactions?.links ?? [];

    const currentPage = transactions?.current_page ?? 1;
    const lastPage = transactions?.last_page ?? 1;
    const total = transactions?.total ?? 0;

    if (total === 0) {
        return null;
    }

    return (
        <div className="pos-pagination">
            <span className="pos-pagination-info">
                Showing {transactions.from}–{transactions.to} of {total}
            </span>

            {lastPage > 1 && (
                <div className="pos-pagination-controls">
                    {links.map((link, index) => {
                        const isPrevious = index === 0;
                        const isNext = index === links.length - 1;

                        const label = isPrevious
                            ? "Previous page"
                            : isNext
                              ? "Next page"
                              : `Page ${index}`;

                        const content = isPrevious ? (
                            <ChevronLeft size={15} />
                        ) : isNext ? (
                            <ChevronRight size={15} />
                        ) : (
                            index
                        );

                        return link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                className={`pos-pagination-button ${
                                    link.active ? "active" : ""
                                }`}
                                aria-label={label}
                                aria-current={
                                    link.active ? "page" : undefined
                                }
                            >
                                {content}
                            </Link>
                        ) : (
                            <span
                                key={index}
                                className="pos-pagination-button disabled"
                            >
                                {content}
                            </span>
                        );
                    })}
                </div>
            )}

            <span className="pos-pagination-page">
                Page {currentPage} of {lastPage}
            </span>
        </div>
    );
}
