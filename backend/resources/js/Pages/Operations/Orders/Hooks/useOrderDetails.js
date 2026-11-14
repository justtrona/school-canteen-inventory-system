
import { useCallback, useEffect, useRef, useState } from "react";

export default function useOrderDetails() {
    const [order, setOrder] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const requestRef = useRef(null);

    const closeModal = useCallback(() => {
        requestRef.current?.abort();
        requestRef.current = null;

        setIsOpen(false);
        setOrder(null);
        setError("");
        setIsLoading(false);
    }, []);

    const viewOrder = useCallback(async (orderId) => {
        requestRef.current?.abort();

        const controller = new AbortController();
        requestRef.current = controller;

        setOrder(null);
        setError("");
        setIsLoading(true);
        setIsOpen(true);

        try {
            const response = await fetch(`/orders/${orderId}`, {
                method: "GET",
                credentials: "same-origin",
                signal: controller.signal,
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(
                    response.status === 404
                        ? "This order could not be found."
                        : "Unable to retrieve order details."
                );
            }

            const data = await response.json();

            if (!data.order) {
                throw new Error("Order details are unavailable.");
            }

            if (requestRef.current === controller) {
                setOrder(data.order);
            }
        } catch (err) {
            if (
                err.name !== "AbortError" &&
                requestRef.current === controller
            ) {
                setError(
                    err.message || "Unable to retrieve order details."
                );
            }
        } finally {
            if (requestRef.current === controller) {
                setIsLoading(false);
                requestRef.current = null;
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            requestRef.current?.abort();
        };
    }, []);

    return {
        order,
        isOpen,
        isLoading,
        error,
        viewOrder,
        closeModal,
    };
}
