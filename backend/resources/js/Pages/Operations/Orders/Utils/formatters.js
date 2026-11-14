
export function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);
}

export function formatNumber(value) {
    return new Intl.NumberFormat("en-PH").format(
        Number(value) || 0
    );
}

export function formatDateTime(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return new Intl.DateTimeFormat("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Manila",
    }).format(date);
}

export function formatPaymentMethod(method) {
    if (!method) return "—";

    return String(method)
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
