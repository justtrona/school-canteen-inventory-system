
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";

import FormModal from "../../../../components/modals/FormModal.jsx";
import SuccessModal from "../../../../components/modals/SuccessModal.jsx";

const API_BASE = "https://psgc.cloud/api/v2";

const PHONE_PATTERN =
    /^(?:(?:\+639|639|09)\d{9}|(?:\+63|0)[2-8]\d{7,9})$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sortLocations = (items) =>
    [...items].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

async function fetchLocations(url, signal) {
    const response = await fetch(url, {
        signal,
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Unable to load address information.");
    }

    const result = await response.json();

    const items = Array.isArray(result)
        ? result
        : result.data;

    if (!Array.isArray(items)) {
        throw new Error("Invalid address API response.");
    }

    return sortLocations(items);
}

export default function AddSupplierModal({ isOpen, onClose }) {
    const [isSuccessModalOpen, setIsSuccessModalOpen] =
        useState(false);

    const [validationErrors, setValidationErrors] = useState({});

    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    const [regionCode, setRegionCode] = useState("");
    const [provinceCode, setProvinceCode] = useState("");
    const [cityCode, setCityCode] = useState("");
    const [barangayCode, setBarangayCode] = useState("");
    const [streetAddress, setStreetAddress] = useState("");

    const [loadingRegions, setLoadingRegions] = useState(false);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingBarangays, setLoadingBarangays] = useState(false);

    const [provincesReady, setProvincesReady] = useState(false);

    const [addressApiError, setAddressApiError] = useState("");

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        is_active: true,
    });

    const selectedRegion = useMemo(
        () => regions.find((item) => item.code === regionCode),
        [regions, regionCode]
    );

    const selectedProvince = useMemo(
        () => provinces.find((item) => item.code === provinceCode),
        [provinces, provinceCode]
    );

    const selectedCity = useMemo(
        () => cities.find((item) => item.code === cityCode),
        [cities, cityCode]
    );

    const selectedBarangay = useMemo(
        () => barangays.find((item) => item.code === barangayCode),
        [barangays, barangayCode]
    );

    const requiresProvince = provinces.length > 0;

    const completeAddress = useMemo(() => {
        const parts = [
            streetAddress.trim(),
            selectedBarangay
                ? `Barangay ${selectedBarangay.name}`
                : "",
            selectedCity?.name || "",
            selectedProvince?.name || "",
            selectedRegion?.name || "",
            "Philippines",
        ];

        return parts.filter(Boolean).join(", ");
    }, [
        streetAddress,
        selectedBarangay,
        selectedCity,
        selectedProvince,
        selectedRegion,
    ]);

    const fieldError = (field) =>
        validationErrors[field] || errors[field];

    const clearFieldError = (field) => {
        setValidationErrors((previous) => {
            const next = { ...previous };
            delete next[field];
            return next;
        });

        clearErrors(field);
    };

    const updateField = (field, value) => {
        setData(field, value);
        clearFieldError(field);
    };

    const clearAddressError = () => {
        setAddressApiError("");
        clearFieldError("address");
    };

    useEffect(() => {
        if (!isOpen) return;

        const controller = new AbortController();

        setLoadingRegions(true);
        setAddressApiError("");

        fetchLocations(
            `${API_BASE}/regions`,
            controller.signal
        )
            .then((items) => {
                setRegions(items);
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setAddressApiError(
                        "Unable to load regions. Check your internet connection and reopen the form."
                    );
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingRegions(false);
                }
            });

        return () => controller.abort();
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !regionCode) {
            setProvinces([]);
            setProvincesReady(false);
            setLoadingProvinces(false);
            return;
        }

        const controller = new AbortController();

        setLoadingProvinces(true);
        setProvincesReady(false);
        setAddressApiError("");

        fetchLocations(
            `${API_BASE}/regions/${encodeURIComponent(
                regionCode
            )}/provinces`,
            controller.signal
        )
            .then((items) => {
                setProvinces(items);
                setProvincesReady(true);
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setProvinces([]);
                    setAddressApiError(
                        "Unable to load provinces. Please select the region again."
                    );
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingProvinces(false);
                }
            });

        return () => controller.abort();
    }, [isOpen, regionCode]);

    useEffect(() => {
        const canLoadCities =
            isOpen &&
            regionCode &&
            provincesReady &&
            (
                provinceCode ||
                !requiresProvince
            );

        if (!canLoadCities) {
            setCities([]);
            setLoadingCities(false);
            return;
        }

        const controller = new AbortController();

        setLoadingCities(true);
        setAddressApiError("");

        const url =
            provinceCode && provinceCode !== "__none__"
                ? `${API_BASE}/provinces/${encodeURIComponent(
                    provinceCode
                )}/cities-municipalities`
                : `${API_BASE}/regions/${encodeURIComponent(
                    regionCode
                )}/cities-municipalities`;

        fetchLocations(url, controller.signal)
            .then((items) => {
                if (provinceCode === "__none__") {
                    setCities(
                        items.filter((item) => !item.province)
                    );
                } else {
                    setCities(items);
                }
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setCities([]);
                    setAddressApiError(
                        "Unable to load cities and municipalities. Please try selecting the province again."
                    );
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingCities(false);
                }
            });

        return () => controller.abort();
    }, [
        isOpen,
        regionCode,
        provinceCode,
        provincesReady,
        requiresProvince,
    ]);

    useEffect(() => {
        if (!isOpen || !cityCode) {
            setBarangays([]);
            setLoadingBarangays(false);
            return;
        }

        const controller = new AbortController();

        setLoadingBarangays(true);
        setAddressApiError("");

        fetchLocations(
            `${API_BASE}/cities-municipalities/${encodeURIComponent(
                cityCode
            )}/barangays`,
            controller.signal
        )
            .then((items) => {
                setBarangays(items);
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setBarangays([]);
                    setAddressApiError(
                        "Unable to load barangays. Please select the city or municipality again."
                    );
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoadingBarangays(false);
                }
            });

        return () => controller.abort();
    }, [isOpen, cityCode]);

    const handleRegionChange = (value) => {
        setRegionCode(value);
        setProvinceCode("");
        setCityCode("");
        setBarangayCode("");

        setProvinces([]);
        setCities([]);
        setBarangays([]);
        setProvincesReady(false);

        clearAddressError();
    };

    const handleProvinceChange = (value) => {
        setProvinceCode(value);
        setCityCode("");
        setBarangayCode("");

        setCities([]);
        setBarangays([]);

        clearAddressError();
    };

    const handleCityChange = (value) => {
        setCityCode(value);
        setBarangayCode("");
        setBarangays([]);

        clearAddressError();
    };

    const handleBarangayChange = (value) => {
        setBarangayCode(value);
        clearAddressError();
    };

    const resetForm = () => {
        reset();
        clearErrors();
        setValidationErrors({});

        setRegionCode("");
        setProvinceCode("");
        setCityCode("");
        setBarangayCode("");
        setStreetAddress("");

        setRegions([]);
        setProvinces([]);
        setCities([]);
        setBarangays([]);

        setProvincesReady(false);
        setAddressApiError("");
    };

    const handleClose = () => {
        if (processing) return;

        resetForm();
        onClose();
    };

    const validateForm = () => {
        const nextErrors = {};

        const name = data.name.trim();
        const contactPerson = data.contact_person.trim();
        const phone = data.phone.replace(/[\s()-]+/g, "");
        const email = data.email.trim();
        const address = streetAddress.trim();

        if (!name) {
            nextErrors.name = "Supplier name is required.";
        } else if (name.length < 3) {
            nextErrors.name =
                "Supplier name must have at least 3 characters.";
        } else if (name.length > 255) {
            nextErrors.name =
                "Supplier name cannot exceed 255 characters.";
        }

        if (!contactPerson) {
            nextErrors.contact_person =
                "Contact person is required.";
        } else if (contactPerson.length < 2) {
            nextErrors.contact_person =
                "Contact person must have at least 2 characters.";
        } else if (contactPerson.length > 255) {
            nextErrors.contact_person =
                "Contact person cannot exceed 255 characters.";
        }

        if (!phone) {
            nextErrors.phone = "Contact number is required.";
        } else if (phone.length > 30) {
            nextErrors.phone =
                "Contact number cannot exceed 30 characters.";
        } else if (!PHONE_PATTERN.test(phone)) {
            nextErrors.phone =
                "Enter a valid Philippine mobile or landline number.";
        }

        if (!email) {
            nextErrors.email = "Email address is required.";
        } else if (email.length > 255) {
            nextErrors.email =
                "Email address cannot exceed 255 characters.";
        } else if (!EMAIL_PATTERN.test(email)) {
            nextErrors.email =
                "Enter a valid email address.";
        }

        if (!regionCode || !selectedRegion) {
            nextErrors.address = "Please select a region.";
        } else if (
            requiresProvince &&
            (!provinceCode ||
                (
                    provinceCode !== "__none__" &&
                    !selectedProvince
                ))
        ) {
            nextErrors.address =
                "Please select a province.";
        } else if (!cityCode || !selectedCity) {
            nextErrors.address =
                "Please select a city or municipality.";
        } else if (!barangayCode || !selectedBarangay) {
            nextErrors.address =
                "Please select a barangay.";
        } else if (!address) {
            nextErrors.address =
                "Street, building, or house address is required.";
        } else if (address.length < 3) {
            nextErrors.address =
                "Enter a more specific street or building address.";
        } else if (completeAddress.length > 1000) {
            nextErrors.address =
                "Complete address cannot exceed 1000 characters.";
        }

        if (typeof data.is_active !== "boolean") {
            nextErrors.is_active =
                "Please select a valid supplier status.";
        }

        setValidationErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (processing || !validateForm()) return;

        transform((formData) => ({
            ...formData,
            name: formData.name.trim(),
            contact_person: formData.contact_person.trim(),
            phone: formData.phone.replace(/[\s()-]+/g, ""),
            email: formData.email.trim().toLowerCase(),
            address: completeAddress,
        }));

        post("/inventory/suppliers", {
            preserveScroll: true,

            onSuccess: () => {
                resetForm();
                onClose();
                setIsSuccessModalOpen(true);
            },
        });
    };

    return (
        <>
            <FormModal
                isOpen={isOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
                title="Add Supplier"
                description="Register a new supplier for your inventory."
                mode="create"
                size="medium"
                formId="add-supplier-form"
                submitLabel="Save Supplier"
                isSubmitting={processing}
            >
                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Supplier Information
                        </h3>

                        <p className="sc-form-section-description">
                            Basic details used to identify this supplier.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="supplier-name"
                            className="sc-form-label"
                        >
                            Supplier Name
                            <span className="sc-form-required">*</span>
                        </label>

                        <input
                            id="supplier-name"
                            type="text"
                            className="sc-form-input"
                            placeholder="e.g. ABC Food Distributors"
                            minLength={3}
                            maxLength={255}
                            value={data.name}
                            onChange={(event) =>
                                updateField("name", event.target.value)
                            }
                            aria-invalid={Boolean(fieldError("name"))}
                            required
                        />

                        {fieldError("name") && (
                            <p className="sc-form-error" role="alert">
                                {fieldError("name")}
                            </p>
                        )}
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="supplier-contact"
                            className="sc-form-label"
                        >
                            Contact Person
                            <span className="sc-form-required">*</span>
                        </label>

                        <input
                            id="supplier-contact"
                            type="text"
                            className="sc-form-input"
                            placeholder="e.g. Juan Dela Cruz"
                            minLength={2}
                            maxLength={255}
                            value={data.contact_person}
                            onChange={(event) =>
                                updateField(
                                    "contact_person",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(
                                fieldError("contact_person")
                            )}
                            required
                        />

                        {fieldError("contact_person") && (
                            <p className="sc-form-error" role="alert">
                                {fieldError("contact_person")}
                            </p>
                        )}
                    </div>
                </div>

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Contact Details
                        </h3>

                        <p className="sc-form-section-description">
                            Information used to communicate with this supplier.
                        </p>
                    </div>

                    <div className="sc-form-row">
                        <div className="sc-form-group">
                            <label
                                htmlFor="supplier-phone"
                                className="sc-form-label"
                            >
                                Contact Number
                                <span className="sc-form-required">*</span>
                            </label>

                            <input
                                id="supplier-phone"
                                type="tel"
                                className="sc-form-input"
                                placeholder="e.g. 09123456789"
                                maxLength={30}
                                value={data.phone}
                                onChange={(event) =>
                                    updateField(
                                        "phone",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    fieldError("phone")
                                )}
                                required
                            />

                            <p className="sc-form-help">
                                Enter a valid Philippine mobile or
                                landline number.
                            </p>

                            {fieldError("phone") && (
                                <p className="sc-form-error" role="alert">
                                    {fieldError("phone")}
                                </p>
                            )}
                        </div>

                        <div className="sc-form-group">
                            <label
                                htmlFor="supplier-email"
                                className="sc-form-label"
                            >
                                Email Address
                                <span className="sc-form-required">*</span>
                            </label>

                            <input
                                id="supplier-email"
                                type="email"
                                className="sc-form-input"
                                placeholder="e.g. supplier@example.com"
                                maxLength={255}
                                value={data.email}
                                onChange={(event) =>
                                    updateField(
                                        "email",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    fieldError("email")
                                )}
                                required
                            />

                            {fieldError("email") && (
                                <p className="sc-form-error" role="alert">
                                    {fieldError("email")}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Supplier Address
                        </h3>

                        <p className="sc-form-section-description">
                            Select the supplier's Philippine location
                            and enter their specific address.
                        </p>
                    </div>

                    <div className="sc-form-row">
                        <div className="sc-form-group">
                            <label
                                htmlFor="supplier-region"
                                className="sc-form-label"
                            >
                                Region
                                <span className="sc-form-required">*</span>
                            </label>

                            <select
                                id="supplier-region"
                                className="sc-form-select"
                                value={regionCode}
                                onChange={(event) =>
                                    handleRegionChange(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    loadingRegions ||
                                    processing ||
                                    Boolean(addressApiError && !regions.length)
                                }
                                required
                            >
                                <option value="">
                                    {loadingRegions
                                        ? "Loading regions..."
                                        : "Select Region"}
                                </option>

                                {regions.map((region) => (
                                    <option
                                        key={region.code}
                                        value={region.code}
                                    >
                                        {region.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sc-form-group">
                            <label
                                htmlFor="supplier-province"
                                className="sc-form-label"
                            >
                                Province
                                {requiresProvince && (
                                    <span className="sc-form-required">*</span>
                                )}
                            </label>

                            <select
                                id="supplier-province"
                                className="sc-form-select"
                                value={provinceCode}
                                onChange={(event) =>
                                    handleProvinceChange(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    !regionCode ||
                                    !provincesReady ||
                                    loadingProvinces ||
                                    processing ||
                                    !requiresProvince
                                }
                                required={requiresProvince}
                            >
                                <option value="">
                                    {!regionCode
                                        ? "Select Region First"
                                        : loadingProvinces
                                            ? "Loading provinces..."
                                            : !requiresProvince
                                                ? "Not Applicable"
                                                : "Select Province"}
                                </option>

                                {provinces.map((province) => (
                                    <option
                                        key={province.code}
                                        value={province.code}
                                    >
                                        {province.name}
                                    </option>
                                ))}

                                {requiresProvince && (
                                    <option value="__none__">
                                        Independent City / No Province
                                    </option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="sc-form-row">
                        <div className="sc-form-group">
                            <label
                                htmlFor="supplier-city"
                                className="sc-form-label"
                            >
                                City / Municipality
                                <span className="sc-form-required">*</span>
                            </label>

                            <select
                                id="supplier-city"
                                className="sc-form-select"
                                value={cityCode}
                                onChange={(event) =>
                                    handleCityChange(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    !regionCode ||
                                    !provincesReady ||
                                    (requiresProvince && !provinceCode) ||
                                    loadingCities ||
                                    processing
                                }
                                required
                            >
                                <option value="">
                                    {loadingCities
                                        ? "Loading cities..."
                                        : "Select City / Municipality"}
                                </option>

                                {cities.map((city) => (
                                    <option
                                        key={city.code}
                                        value={city.code}
                                    >
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="sc-form-group">
                            <label
                                htmlFor="supplier-barangay"
                                className="sc-form-label"
                            >
                                Barangay
                                <span className="sc-form-required">*</span>
                            </label>

                            <select
                                id="supplier-barangay"
                                className="sc-form-select"
                                value={barangayCode}
                                onChange={(event) =>
                                    handleBarangayChange(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    !cityCode ||
                                    loadingBarangays ||
                                    processing
                                }
                                required
                            >
                                <option value="">
                                    {loadingBarangays
                                        ? "Loading barangays..."
                                        : "Select Barangay"}
                                </option>

                                {barangays.map((barangay) => (
                                    <option
                                        key={barangay.code}
                                        value={barangay.code}
                                    >
                                        {barangay.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="supplier-street"
                            className="sc-form-label"
                        >
                            Street / Building / House Number
                            <span className="sc-form-required">*</span>
                        </label>

                        <textarea
                            id="supplier-street"
                            className="sc-form-textarea"
                            rows={2}
                            maxLength={500}
                            placeholder="e.g. Unit 5, ABC Building, J.P. Laurel Avenue"
                            value={streetAddress}
                            onChange={(event) => {
                                setStreetAddress(event.target.value);
                                clearAddressError();
                            }}
                            required
                        />
                    </div>

                    {addressApiError && (
                        <p
                            className="sc-form-error"
                            role="alert"
                        >
                            {addressApiError}
                        </p>
                    )}

                    {fieldError("address") && (
                        <p
                            className="sc-form-error"
                            role="alert"
                        >
                            {fieldError("address")}
                        </p>
                    )}

                    {regionCode &&
                        cityCode &&
                        barangayCode &&
                        streetAddress.trim() && (
                            <div className="sc-form-notice">
                                <div
                                    className="sc-form-notice-icon"
                                    aria-hidden="true"
                                >
                                    i
                                </div>

                                <div className="sc-form-notice-content">
                                    <p className="sc-form-notice-title">
                                        Complete Address Preview
                                    </p>

                                    <p className="sc-form-notice-description">
                                        {completeAddress}
                                    </p>
                                </div>
                            </div>
                        )}
                </div>

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Availability
                        </h3>

                        <p className="sc-form-section-description">
                            Control whether this supplier can be
                            selected for new inventory transactions.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="supplier-status"
                            className="sc-form-label"
                        >
                            Supplier Status
                            <span className="sc-form-required">*</span>
                        </label>

                        <select
                            id="supplier-status"
                            className="sc-form-select"
                            value={data.is_active ? "1" : "0"}
                            onChange={(event) =>
                                updateField(
                                    "is_active",
                                    event.target.value === "1"
                                )
                            }
                            aria-invalid={Boolean(
                                fieldError("is_active")
                            )}
                            required
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>

                        <p className="sc-form-help">
                            {data.is_active
                                ? "Active suppliers can be selected for new inventory transactions."
                                : "Inactive suppliers remain in the system but cannot be selected for new transactions."}
                        </p>

                        {fieldError("is_active") && (
                            <p className="sc-form-error" role="alert">
                                {fieldError("is_active")}
                            </p>
                        )}
                    </div>
                </div>

                <div className="sc-form-notice">
                    <div
                        className="sc-form-notice-icon"
                        aria-hidden="true"
                    >
                        i
                    </div>

                    <div className="sc-form-notice-content">
                        <p className="sc-form-notice-title">
                            Supplier Records
                        </p>

                        <p className="sc-form-notice-description">
                            All supplier information is required.
                            Select a complete Philippine address
                            before saving. Supplier records are
                            preserved for inventory tracking.
                        </p>
                    </div>
                </div>
            </FormModal>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Supplier Added Successfully!"
                message="The supplier has been saved successfully."
                buttonLabel="Done"
            />
        </>
    );
}
