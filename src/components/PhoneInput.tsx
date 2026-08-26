/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { useState, useRef, useEffect, useMemo } from "react";
import "./PhoneInput.css";

export interface Country {
  code: string;       // ISO 2-letter code, e.g. "IN"
  name: string;       // e.g. "India"
  dialCode: string;   // e.g. "+91"
  format?: string;    // e.g. "##### #####"
}

export const COUNTRIES: Country[] = [
  { code: "IN", name: "India", dialCode: "+91", format: "##### #####" },
  { code: "US", name: "United States", dialCode: "+1", format: "### ### ####" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", format: "#### ######" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", format: "## ### ####" },
  { code: "CA", name: "Canada", dialCode: "+1", format: "### ### ####" },
  { code: "AU", name: "Australia", dialCode: "+61", format: "### ### ###" },
  { code: "SG", name: "Singapore", dialCode: "+65", format: "#### ####" },
  { code: "DE", name: "Germany", dialCode: "+49", format: "### ########" },
  { code: "FR", name: "France", dialCode: "+33", format: "# ## ## ## ##" },
  { code: "JP", name: "Japan", dialCode: "+81", format: "## #### ####" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", format: "## ### ####" },
  { code: "QA", name: "Qatar", dialCode: "+974", format: "#### ####" },
  { code: "KW", name: "Kuwait", dialCode: "+965", format: "#### ####" },
  { code: "OM", name: "Oman", dialCode: "+968", format: "#### ####" },
  { code: "BH", name: "Bahrain", dialCode: "+973", format: "#### ####" },
  { code: "MY", name: "Malaysia", dialCode: "+60", format: "## ### ####" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", format: "### ### ####" },
  { code: "CH", name: "Switzerland", dialCode: "+41", format: "## ### ## ##" },
  { code: "NL", name: "Netherlands", dialCode: "+31", format: "# ########" },
  { code: "SE", name: "Sweden", dialCode: "+46", format: "## ### ## ##" },
  { code: "NO", name: "Norway", dialCode: "+47", format: "### ## ###" },
  { code: "DK", name: "Denmark", dialCode: "+45", format: "## ## ## ##" },
  { code: "IT", name: "Italy", dialCode: "+39", format: "### ### ####" },
  { code: "ES", name: "Spain", dialCode: "+34", format: "### ### ###" },
  { code: "IE", name: "Ireland", dialCode: "+353", format: "## ### ####" },
  { code: "BE", name: "Belgium", dialCode: "+32", format: "### ## ## ##" },
  { code: "AT", name: "Austria", dialCode: "+43", format: "### #######" },
  { code: "ZA", name: "South Africa", dialCode: "+27", format: "## ### ####" },
  { code: "KR", name: "South Korea", dialCode: "+82", format: "## #### ####" },
  { code: "HK", name: "Hong Kong", dialCode: "+852", format: "#### ####" },
  { code: "TH", name: "Thailand", dialCode: "+66", format: "## ### ####" },
  { code: "ID", name: "Indonesia", dialCode: "+62", format: "### ### ####" },
  { code: "PH", name: "Philippines", dialCode: "+63", format: "### ### ####" },
  { code: "VN", name: "Vietnam", dialCode: "+84", format: "## ### ####" },
  { code: "BR", name: "Brazil", dialCode: "+55", format: "## ##### ####" },
  { code: "MX", name: "Mexico", dialCode: "+52", format: "### ### ####" },
  { code: "PT", name: "Portugal", dialCode: "+351", format: "### ### ###" },
  { code: "PL", name: "Poland", dialCode: "+48", format: "### ### ###" },
  { code: "GR", name: "Greece", dialCode: "+30", format: "### ### ####" },
  { code: "TR", name: "Turkey", dialCode: "+90", format: "### ### ####" },
  { code: "EG", name: "Egypt", dialCode: "+20", format: "## #### ####" },
  { code: "NG", name: "Nigeria", dialCode: "+234", format: "### ### ####" },
  { code: "KE", name: "Kenya", dialCode: "+254", format: "### ######" },
  { code: "AR", name: "Argentina", dialCode: "+54", format: "## #### ####" },
];

export interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
}

export default function PhoneInput({
  value = "",
  onChange,
  error,
  label = "Phone Number",
  required = false,
  disabled = false,
  id = "phone-input",
  placeholder = "Enter phone number",
}: PhoneInputProps) {
  // Parse initial country or default to India (+91)
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => {
    if (value) {
      const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (matched) return matched;
    }
    return COUNTRIES[0]; // India
  });

  const [rawNumber, setRawNumber] = useState<string>(() => {
    if (!value) return "";
    if (value.startsWith(selectedCountry.dialCode)) {
      return value.slice(selectedCountry.dialCode.length).trim();
    }
    return value;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Sync external value changes
  useEffect(() => {
    if (!value) {
      setRawNumber("");
      return;
    }
    const matched = COUNTRIES.find((c) => value.startsWith(c.dialCode));
    if (matched && matched.code !== selectedCountry.code) {
      setSelectedCountry(matched);
      setRawNumber(value.slice(matched.dialCode.length).trim());
    }
  }, [value, selectedCountry.code]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery("");

    // Emit updated composite value
    const formatted = rawNumber ? `${country.dialCode} ${rawNumber.trim()}` : "";
    onChange(formatted);
    triggerRef.current?.focus();
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextRaw = e.target.value.replace(/[^\d\s-]/g, "");
    setRawNumber(nextRaw);

    const formatted = nextRaw.trim() ? `${selectedCountry.dialCode} ${nextRaw.trim()}` : "";
    onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
      triggerRef.current?.focus();
    }
  };

  return (
    <div className={`leafly-phone-field ${error ? "has-error" : ""}`}>
      {label && (
        <label htmlFor={id} className="leafly-phone-label">
          {label} {required && <span className="leafly-phone-req">*</span>}
        </label>
      )}

      <div className={`leafly-phone-container ${isOpen ? "dropdown-open" : ""}`}>
        {/* Country Selector Trigger */}
        <div className="leafly-phone-selector" ref={dropdownRef}>
          <button
            ref={triggerRef}
            type="button"
            className="leafly-phone-trigger"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label={`Selected country: ${selectedCountry.name} (${selectedCountry.dialCode})`}
            disabled={disabled}
          >
            <span className="leafly-phone-badge" aria-hidden="true">
              {selectedCountry.code}
            </span>
            <span className="leafly-phone-dialcode">{selectedCountry.dialCode}</span>
            <svg
              className={`leafly-phone-arrow ${isOpen ? "open" : ""}`}
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Searchable Dropdown */}
          {isOpen && (
            <div className="leafly-phone-dropdown" role="listbox" onKeyDown={handleKeyDown}>
              <div className="leafly-phone-search-box">
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="leafly-phone-search-icon"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="leafly-phone-search-input"
                  placeholder="Search country or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search countries"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="leafly-phone-search-clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="leafly-phone-list" tabIndex={-1}>
                {filteredCountries.length === 0 ? (
                  <div className="leafly-phone-empty">No countries found</div>
                ) : (
                  filteredCountries.map((c) => {
                    const isSelected = c.code === selectedCountry.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        className={`leafly-phone-item ${isSelected ? "selected" : ""}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleCountrySelect(c)}
                      >
                        <span className="leafly-phone-item-badge">{c.code}</span>
                        <span className="leafly-phone-item-name">{c.name}</span>
                        <span className="leafly-phone-item-code">{c.dialCode}</span>
                        {isSelected && <span className="leafly-phone-check">✓</span>}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Separator Divider */}
        <span className="leafly-phone-divider" aria-hidden="true" />

        {/* Phone Number Input */}
        <input
          id={id}
          type="tel"
          className="leafly-phone-input"
          value={rawNumber}
          onChange={handleNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="tel-national"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>

      {error && (
        <small id={`${id}-error`} className="leafly-phone-error-text" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}
