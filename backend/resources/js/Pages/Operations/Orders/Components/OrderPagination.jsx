
import React from "react";
import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OrderPagination({ orders }) {
    const links = orders?.links ?? [];
    const currentPage = orders?.current_page ?? 1;
    const lastPage = orders?.last_page ?? 1;
    const total = orders?.total ?? 0;

    if (total === 0) {
        return null;
    }

    return (
        <div className="orders-pagination">
            <span className="orders-pagination-info">
                Showing {orders.from}–{orders.to} of {total}
            </span>

            {lastPage > 1 && (
                <div className="orders-pagination-controls">
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
                                className={`orders-pagination-button ${
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
                                className="orders-pagination-button disabled"
                            >
                                {content}
                            </span>
                        );
                    })}
                </div>
            )}

            <span className="orders-pagination-page">
                Page {currentPage} of {lastPage}
            </span>
        </div>
    );
}
