import { useMemo, useState, useRef, type ReactNode, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderContext } from "../context/OrderContext";
import { useCoupons } from "../context/CouponContext";
import defaultAvatarImg from "../assets/leafly-logo.webp";
import mainImage from "../assets/main.webp";
import image2 from "../assets/image2.webp";
import image3 from "../assets/image3.webp";
import image5 from "../assets/image5.webp";
import Footer from "../components/Footer";
import PhoneInput from "../components/PhoneInput";
import "./Profile.css";

type SidebarItemId =
  | "overview"
  | "orders"
  | "coupons"
  | "preferences"
  | "notifications"
  | "security";

type DetailField = "fullName" | "email" | "phone" | "dob" | "gender";

type DetailsState = Record<DetailField, string>;

type PreferencesState = {
  favoriteTypes: string;
  flavorNotes: string;
  caffeinePreference: string;
  brewingStyle: string;
  timeOfDay: string;
};

type NotificationPreferences = {
  orderUpdates: boolean;
  ritualTips: boolean;
  newHarvestAlerts: boolean;
  exclusiveVouchers: boolean;
};

type SidebarItem = {
  id: SidebarItemId;
  label: string;
  icon: ReactNode;
};

type RecommendationItem = {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
};

const sidebarItems: SidebarItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z" />
      </svg>
    ),
  },
  {
    id: "orders",
    label: "Orders",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4h10l2 4v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8l2-4Zm0 6h10M9 2h6v2H9V2Z" />
      </svg>
    ),
  },
  {
    id: "coupons",
    label: "Coupons",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6h16a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8a2 2 0 0 1 2-2Zm5 3v6m6-6v6" />
      </svg>
    ),
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 5h10v2H7V5Zm-2 6h14v2H5v-2Zm3 6h8v2H8v-2Z" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a5 5 0 0 1 5 5v4l2 4H5l2-4V8a5 5 0 0 1 5-5Zm0 18a2.5 2.5 0 0 1-2.5-2.5h5A2.5 2.5 0 0 1 12 21Z" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 5 6v5c0 4.3 2.7 8.1 7 10 4.3-1.9 7-5.7 7-10V6l-7-3Zm0 5.5 3.2 3.2-1.2 1.2-2 2-2-2-1.2-1.2L12 8.5Z" />
      </svg>
    ),
  },
];

const initialDetails: DetailsState = {
  fullName: "Aarav Kapoor",
  email: "aarav.kapoor@leafly.com",
  phone: "+91 98200 12345",
  dob: "14 April 1992",
  gender: "Male",
};

const initialPreferences: PreferencesState = {
  favoriteTypes: "Green Tea, Oolong, White Tea",
  flavorNotes: "Floral, Earthy, Fresh",
  caffeinePreference: "Medium",
  brewingStyle: "Loose Leaf",
  timeOfDay: "Morning, Afternoon",
};

const initialNotifications: NotificationPreferences = {
  orderUpdates: true,
  ritualTips: true,
  newHarvestAlerts: true,
  exclusiveVouchers: false,
};

const recommendationItems: RecommendationItem[] = [
  {
    id: 1,
    name: "Himalayan Green Tea",
    category: "Green Tea",
    price: "₹699",
    image: image2,
  },
  {
    id: 2,
    name: "Silver Tips White Tea",
    category: "White Tea",
    price: "₹899",
    image: image3,
  },
  {
    id: 3,
    name: "Artisan Oolong",
    category: "Oolong",
    price: "₹999",
    image: image5,
  },
];

const promiseItems = [
  {
    title: "WHOLE LEAF TEA",
    text: "Real leaves. Real taste.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2c3 4.5 5 7.5 5 10a5 5 0 1 1-10 0c0-2.5 2-5.5 5-10Zm0 7.2c1.6 2 2.5 3.4 2.5 4.8A2.5 2.5 0 1 1 9.5 14c0-1.4.9-2.8 2.5-4.8Z" />
      </svg>
    ),
  },
  {
    title: "CAREFULLY SOURCED",
    text: "From the best gardens around the world.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5c0 5.3-4.2 9.5-9.5 9.5S2.5 17.3 2.5 12 7.7 2.5 12 2.5Zm0 3A6.5 6.5 0 0 0 5.5 12c0 3.6 2.9 6.5 6.5 6.5S18.5 15.6 18.5 12A6.5 6.5 0 0 0 12 5.5Zm-1 2h2v4h3v2h-5V7.5Z" />
      </svg>
    ),
  },
  {
    title: "FRESH & PURE",
    text: "Packed with care to preserve freshness.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.5c1.6 0 2.8 1.2 2.8 2.8v1.1h1.4a2.3 2.3 0 0 1 2.3 2.3V13c0 1.8-1.4 3.2-3.2 3.2H8.7a3.2 3.2 0 0 1-3.2-3.2v-3.3a2.3 2.3 0 0 1 2.3-2.3h1.4V6.3C9.2 4.7 10.4 3.5 12 3.5Zm0 2.1a.8.8 0 0 0-.8.8v1.1h1.6V6.4a.8.8 0 0 0-.8-.8ZM10 12.5h4v2h-4v-2Z" />
      </svg>
    ),
  },
  {
    title: "MADE FOR YOU",
    text: "Because every cup should feel personal.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3a4 4 0 0 1 4 4v1.2A3.8 3.8 0 0 1 18.8 12v.8A4.2 4.2 0 0 1 14.6 17H9.4A4.2 4.2 0 0 1 5.2 12.8V12A3.8 3.8 0 0 1 8 8.2V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v1.2h4V7a2 2 0 0 0-2-2Zm-4 8.2v.6a2.2 2.2 0 0 0 2.2 2.2h5.6a2.2 2.2 0 0 0 2.2-2.2v-.6H8Z" />
      </svg>
    ),
  },
];

const formatLabel = (value: string) => value.trim();

const AVATAR_STORAGE_KEY = "leafly_profile_avatar_v1";
const NOTIF_STORAGE_KEY = "leafly_profile_notifs_v1";

export default function Profile() {
  const navigate = useNavigate();
  const { orders } = useOrderContext();
  const { coupons } = useCoupons();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const orderSummary = useMemo(() => {
    const delivered = orders.filter((order) => order.status === "Delivered").length;
    const processing = orders.filter((order) => order.status === "Processing").length;
    const shipped = orders.filter((order) => order.status === "Shipped").length;
    const cancelled = orders.filter((order) => order.status === "Cancelled").length;

    return {
      totalOrders: orders.length,
      delivered,
      processing,
      shipped,
      cancelled,
    };
  }, [orders]);

  const [selectedSidebar, setSelectedSidebar] = useState<SidebarItemId>("overview");
  const [details, setDetails] = useState<DetailsState>(initialDetails);
  const [preferences, setPreferences] = useState<PreferencesState>(initialPreferences);
  const [notifications, setNotifications] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(AVATAR_STORAGE_KEY) || "";
    } catch {
      return "";
    }
  });

  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notice, setNotice] = useState("Welcome back. Your account is ready.");
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeUserName = useMemo(() => details.fullName || "Aarav Kapoor", [details.fullName]);

  const handleSidebarClick = (item: SidebarItem) => {
    setSelectedSidebar(item.id);

    if (item.id === "orders") {
      navigate("/orders");
      return;
    }

    if (item.id === "overview") {
      setNotice("Welcome back. Your account is ready.");
      return;
    }

    if (item.id === "coupons") {
      setNotice("Explore your earned rewards and active vouchers.");
      return;
    }

    if (item.id === "preferences") {
      setNotice("Your personalized tea flavor preferences.");
      return;
    }

    if (item.id === "notifications") {
      setNotice("Manage your email & SMS ritual notifications.");
      return;
    }

    if (item.id === "security") {
      setNotice("Account authentication & session security overview.");
      return;
    }
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Please select a valid image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setNotice("Selected image is too large. Please select an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatarUrl(result);
        try {
          localStorage.setItem(AVATAR_STORAGE_KEY, result);
          setNotice("Profile photo updated successfully.");
        } catch {
          setNotice("Profile photo updated for this session.");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    setAvatarUrl("");
    try {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
      setNotice("Profile photo reset to default avatar.");
    } catch {
      // ignore
    }
  };

  const handleEditDetails = () => {
    setIsEditingDetails(true);
    setDetailsSaved(false);
  };

  const handleSaveDetails = () => {
    setIsEditingDetails(false);
    setDetailsSaved(true);
    setNotice("Your personal details have been updated.");
  };

  const handleCancelDetails = () => {
    setIsEditingDetails(false);
    setDetailsSaved(false);
    setDetails(initialDetails);
    setNotice("Changes were discarded.");
  };

  const handleEditPreferences = () => {
    setIsEditingPreferences(true);
    setPreferencesSaved(false);
  };

  const handleSavePreferences = () => {
    setIsEditingPreferences(false);
    setPreferencesSaved(true);
    setNotice("Your tea preferences have been saved.");
  };

  const handleCancelPreferences = () => {
    setIsEditingPreferences(false);
    setPreferencesSaved(false);
    setPreferences(initialPreferences);
    setNotice("Preferences were not changed.");
  };

  const handleToggleNotification = (key: keyof NotificationPreferences) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setNotifSaved(true);
    setNotice("Notification preferences updated.");
    window.setTimeout(() => setNotifSaved(false), 3000);
  };

  const handleCopyCoupon = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setNotice(`Coupon ${code} copied to clipboard! Apply it at checkout.`);
      window.setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExploreRecommendations = () => {
    navigate("/shop");
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setNotice("You have been logged out of this demo session.");
  };

  return (
    <main className="profile-page">
      <div className="profile-page-shell">
        <aside className="profile-sidebar" aria-label="Profile navigation">
          <div className="profile-sidebar-brand">
            <span>LEAFLY</span>
            <small>ACCOUNT</small>
          </div>

          <nav className="profile-sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`profile-sidebar-item ${selectedSidebar === item.id ? "active" : ""}`}
                onClick={() => handleSidebarClick(item)}
                aria-current={selectedSidebar === item.id ? "page" : undefined}
              >
                <span className="profile-sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="profile-sidebar-divider" />

          <button
            type="button"
            className="profile-sidebar-logout"
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Log out from account"
          >
            <span className="profile-sidebar-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 7V5a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3v-2h2v2a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-5a1 1 0 0 0-1 1v2H9Zm-2.2 5.5L12 12l-5.2-.5-1.3 1.5L8 15l.9.9 1.3 1.5L9.8 19l-1.3-1.5L6 15.7l2.5-2.2Z" />
              </svg>
            </span>
            <span>Logout</span>
          </button>
        </aside>

        <section className="profile-main-content">
          <header className="profile-hero">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar" aria-label="Profile avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={activeUserName} className="profile-avatar-custom-img" />
                ) : (
                  <div className="profile-avatar-default">
                    <img src={defaultAvatarImg} alt="Leafly Logo" className="profile-default-leafly-logo" />
                    <span>{activeUserName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
                aria-label="Upload avatar image"
              />
              <button
                type="button"
                className="profile-avatar-edit"
                aria-label="Edit profile photo"
                title="Change profile photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.4 7.5c.4-.4.4-1 0-1.4l-1.1-1.1a1 1 0 0 0-1.4 0L16 6.1l2.5 2.5 1-1Zm-2.9 2.1L8.8 16.2l-2.6.6.6-2.6 7.7-7.7 2.5 2.5Z" />
                </svg>
              </button>
            </div>

            <div className="profile-hero-copy">
              <p className="profile-eyebrow">WELCOME BACK,</p>
              <h1>{activeUserName}</h1>
              <p className="profile-quote">“Tea is a quiet companion in a noisy world.”</p>

              <div className="profile-meta-row">
                <div>
                  <span className="profile-meta-label">Email</span>
                  <strong>{details.email}</strong>
                </div>
                <div>
                  <span className="profile-meta-label">Active Tier</span>
                  <strong>Leafly Connoisseur</strong>
                </div>
                <div>
                  <span className="profile-meta-label">Available Vouchers</span>
                  <strong>{coupons.filter((c) => c.status === "available").length} Active</strong>
                </div>
              </div>

              {avatarUrl && (
                <button type="button" className="profile-avatar-reset-btn" onClick={handleResetAvatar}>
                  Reset to default avatar
                </button>
              )}
            </div>

            <div className="profile-hero-image-wrap">
              <img src={mainImage} alt="Tea ritual at home with warm natural lighting" loading="eager" fetchPriority="high" />
            </div>
          </header>

          {notice && (
            <div className="profile-notice" role="status" aria-live="polite">
              {notice}
            </div>
          )}

          {/* VIEW: OVERVIEW */}
          {selectedSidebar === "overview" && (
            <>
              <section className="profile-summary-grid" aria-label="Account summary">
                <article className="profile-summary-card">
                  <div className="profile-summary-header">
                    <p className="profile-summary-label">MY ORDERS</p>
                    <span className="profile-summary-total">{orderSummary.totalOrders}</span>
                  </div>

                  <div className="profile-summary-body">
                    <div className="profile-summary-line">
                      <span>Delivered</span>
                      <strong>{orderSummary.delivered}</strong>
                    </div>
                    <div className="profile-summary-line">
                      <span>Processing</span>
                      <strong>{orderSummary.processing}</strong>
                    </div>
                    <div className="profile-summary-line">
                      <span>Shipped</span>
                      <strong>{orderSummary.shipped}</strong>
                    </div>
                    <div className="profile-summary-line">
                      <span>Cancelled</span>
                      <strong>{orderSummary.cancelled}</strong>
                    </div>
                  </div>

                  <button type="button" className="profile-summary-button" onClick={() => navigate("/orders")}>
                    VIEW ORDERS
                  </button>
                </article>

                <article className="profile-summary-card">
                  <div className="profile-summary-header">
                    <p className="profile-summary-label">MY COUPONS</p>
                    <span className="profile-summary-total">{coupons.filter((c) => c.status === "available").length}</span>
                  </div>

                  <div className="profile-summary-body">
                    {coupons.slice(0, 2).map((c) => (
                      <div key={c.id} className="profile-summary-line">
                        <span>{c.code}</span>
                        <strong>{c.discountType === "fixed" ? `₹${c.discountValue} OFF` : `${c.discountValue}% OFF`}</strong>
                      </div>
                    ))}
                  </div>

                  <button type="button" className="profile-summary-button" onClick={() => setSelectedSidebar("coupons")}>
                    EXPLORE COUPONS
                  </button>
                </article>

                <article className="profile-summary-card">
                  <div className="profile-summary-header">
                    <p className="profile-summary-label">TEA TASTE PROFILE</p>
                    <span className="profile-summary-total">Active</span>
                  </div>

                  <div className="profile-summary-body">
                    <div className="profile-summary-line">
                      <span>Favorite</span>
                      <strong>{preferences.favoriteTypes.split(",")[0] || "Green Tea"}</strong>
                    </div>
                    <div className="profile-summary-line">
                      <span>Brewing</span>
                      <strong>{preferences.brewingStyle}</strong>
                    </div>
                  </div>

                  <button type="button" className="profile-summary-button" onClick={() => setSelectedSidebar("preferences")}>
                    UPDATE PREFERENCES
                  </button>
                </article>
              </section>

              <section className="profile-detail-grid">
                <article className="profile-card profile-details-card">
                  <div className="profile-card-header">
                    <div>
                      <p className="profile-card-kicker">PROFILE</p>
                      <h2>PERSONAL DETAILS</h2>
                    </div>

                    {!isEditingDetails ? (
                      <button type="button" className="profile-edit-button" onClick={handleEditDetails}>
                        EDIT
                      </button>
                    ) : null}
                  </div>

                  {!isEditingDetails ? (
                    <div className="profile-details-list">
                      {[
                        { label: "Full Name", value: details.fullName },
                        { label: "Email Address", value: details.email },
                        { label: "Phone Number", value: details.phone },
                        { label: "Date of Birth", value: details.dob },
                        { label: "Gender", value: details.gender },
                      ].map((field) => (
                        <div key={field.label} className="profile-detail-row">
                          <span>{field.label}</span>
                          <strong>{field.value}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="profile-edit-form">
                      <label className="profile-form-field">
                        <span>Full Name</span>
                        <input
                          type="text"
                          value={details.fullName}
                          onChange={(event) => setDetails((current) => ({ ...current, fullName: event.target.value }))}
                        />
                      </label>

                      <label className="profile-form-field">
                        <span>Email Address</span>
                        <input
                          type="email"
                          value={details.email}
                          onChange={(event) => setDetails((current) => ({ ...current, email: event.target.value }))}
                        />
                      </label>

                      <PhoneInput
                        id="profile-phone"
                        label="Phone Number"
                        value={details.phone}
                        onChange={(value) => setDetails((current) => ({ ...current, phone: value }))}
                      />

                      <label className="profile-form-field">
                        <span>Date of Birth</span>
                        <input
                          type="text"
                          value={details.dob}
                          onChange={(event) => setDetails((current) => ({ ...current, dob: event.target.value }))}
                        />
                      </label>

                      <label className="profile-form-field">
                        <span>Gender</span>
                        <input
                          type="text"
                          value={details.gender}
                          onChange={(event) => setDetails((current) => ({ ...current, gender: event.target.value }))}
                        />
                      </label>

                      <div className="profile-edit-actions">
                        <button type="button" className="profile-secondary-button" onClick={handleCancelDetails}>
                          CANCEL
                        </button>
                        <button type="button" className="profile-primary-button" onClick={handleSaveDetails}>
                          SAVE CHANGES
                        </button>
                      </div>
                    </div>
                  )}

                  {detailsSaved && !isEditingDetails && (
                    <p className="profile-success-text">Your details have been updated.</p>
                  )}
                </article>

                <article className="profile-card profile-preferences-card">
                  <div className="profile-card-header">
                    <div>
                      <p className="profile-card-kicker">TASTES</p>
                      <h2>TEA PREFERENCES</h2>
                    </div>

                    {!isEditingPreferences ? (
                      <button type="button" className="profile-edit-button" onClick={handleEditPreferences}>
                        EDIT
                      </button>
                    ) : null}
                  </div>

                  <p className="profile-subtitle">Tell us your taste. We&apos;ll make it personal.</p>

                  {!isEditingPreferences ? (
                    <div className="profile-preference-list">
                      {Object.entries(preferences).map(([key, value]) => (
                        <div key={key} className="profile-preference-row">
                          <span className="profile-preference-label">{formatLabel(key.replace(/([A-Z])/g, " $1"))}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="profile-edit-form">
                      <label className="profile-form-field">
                        <span>Favourite Types</span>
                        <input
                          type="text"
                          value={preferences.favoriteTypes}
                          onChange={(event) => setPreferences((current) => ({ ...current, favoriteTypes: event.target.value }))}
                        />
                      </label>

                      <label className="profile-form-field">
                        <span>Flavour Notes</span>
                        <input
                          type="text"
                          value={preferences.flavorNotes}
                          onChange={(event) => setPreferences((current) => ({ ...current, flavorNotes: event.target.value }))}
                        />
                      </label>

                      <label className="profile-form-field">
                        <span>Caffeine Preference</span>
                        <input
                          type="text"
                          value={preferences.caffeinePreference}
                          onChange={(event) => setPreferences((current) => ({ ...current, caffeinePreference: event.target.value }))}
                        />
                      </label>

                      <label className="profile-form-field">
                        <span>Brewing Style</span>
                        <input
                          type="text"
                          value={preferences.brewingStyle}
                          onChange={(event) => setPreferences((current) => ({ ...current, brewingStyle: event.target.value }))}
                        />
                      </label>

                      <label className="profile-form-field">
                        <span>Time of Day</span>
                        <input
                          type="text"
                          value={preferences.timeOfDay}
                          onChange={(event) => setPreferences((current) => ({ ...current, timeOfDay: event.target.value }))}
                        />
                      </label>

                      <div className="profile-edit-actions">
                        <button type="button" className="profile-secondary-button" onClick={handleCancelPreferences}>
                          CANCEL
                        </button>
                        <button type="button" className="profile-primary-button" onClick={handleSavePreferences}>
                          SAVE PREFERENCES
                        </button>
                      </div>
                    </div>
                  )}

                  {preferencesSaved && !isEditingPreferences && (
                    <p className="profile-success-text">Your preferences have been saved.</p>
                  )}
                </article>
              </section>
            </>
          )}

          {/* VIEW: COUPONS */}
          {selectedSidebar === "coupons" && (
            <section className="profile-card profile-coupons-view">
              <div className="profile-card-header">
                <div>
                  <p className="profile-card-kicker">REWARDS & PRIVILEGES</p>
                  <h2>MY TEA VOUCHERS</h2>
                </div>
                <span className="profile-coupons-count-badge">
                  {coupons.filter((c) => c.status === "available").length} Available
                </span>
              </div>
              <p className="profile-subtitle">
                Apply your vouchers at checkout for exclusive single-origin savings.
              </p>

              <div className="profile-coupons-grid">
                {coupons.map((coupon) => {
                  const isAvailable = coupon.status === "available";
                  return (
                    <article
                      key={coupon.id}
                      className={`profile-coupon-card ${isAvailable ? "available" : "used"}`}
                    >
                      <div className="profile-coupon-card-top">
                        <span className="profile-coupon-tag">{coupon.title}</span>
                        <span className={`profile-coupon-status ${coupon.status}`}>
                          {coupon.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="profile-coupon-discount">
                        <strong>
                          {coupon.discountType === "fixed"
                            ? `₹${coupon.discountValue} OFF`
                            : `${coupon.discountValue}% OFF`}
                        </strong>
                      </div>

                      <p className="profile-coupon-condition">{coupon.applicableCondition}</p>

                      <div className="profile-coupon-bottom">
                        <div className="profile-coupon-code-box">
                          <span>CODE</span>
                          <strong>{coupon.code}</strong>
                        </div>
                        {isAvailable && (
                          <button
                            type="button"
                            className="profile-coupon-copy-btn"
                            onClick={() => handleCopyCoupon(coupon.code)}
                          >
                            {copiedCode === coupon.code ? "COPIED ✓" : "COPY"}
                          </button>
                        )}
                      </div>

                      {coupon.expiryDate && (
                        <p className="profile-coupon-expiry">Expires: {coupon.expiryDate}</p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* VIEW: PREFERENCES */}
          {selectedSidebar === "preferences" && (
            <section className="profile-card profile-preferences-view">
              <div className="profile-card-header">
                <div>
                  <p className="profile-card-kicker">TASTES & CRAFT</p>
                  <h2>TEA PREFERENCES</h2>
                </div>
                {!isEditingPreferences && (
                  <button type="button" className="profile-edit-button" onClick={handleEditPreferences}>
                    EDIT
                  </button>
                )}
              </div>
              <p className="profile-subtitle">
                Your profile shapes how we recommend harvest batches and seasonal single-origin releases.
              </p>

              {!isEditingPreferences ? (
                <div className="profile-preference-list">
                  {Object.entries(preferences).map(([key, value]) => (
                    <div key={key} className="profile-preference-row">
                      <span className="profile-preference-label">{formatLabel(key.replace(/([A-Z])/g, " $1"))}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="profile-edit-form">
                  <label className="profile-form-field">
                    <span>Favourite Types</span>
                    <input
                      type="text"
                      value={preferences.favoriteTypes}
                      onChange={(event) => setPreferences((current) => ({ ...current, favoriteTypes: event.target.value }))}
                    />
                  </label>

                  <label className="profile-form-field">
                    <span>Flavour Notes</span>
                    <input
                      type="text"
                      value={preferences.flavorNotes}
                      onChange={(event) => setPreferences((current) => ({ ...current, flavorNotes: event.target.value }))}
                    />
                  </label>

                  <label className="profile-form-field">
                    <span>Caffeine Preference</span>
                    <input
                      type="text"
                      value={preferences.caffeinePreference}
                      onChange={(event) => setPreferences((current) => ({ ...current, caffeinePreference: event.target.value }))}
                    />
                  </label>

                  <label className="profile-form-field">
                    <span>Brewing Style</span>
                    <input
                      type="text"
                      value={preferences.brewingStyle}
                      onChange={(event) => setPreferences((current) => ({ ...current, brewingStyle: event.target.value }))}
                    />
                  </label>

                  <label className="profile-form-field">
                    <span>Time of Day</span>
                    <input
                      type="text"
                      value={preferences.timeOfDay}
                      onChange={(event) => setPreferences((current) => ({ ...current, timeOfDay: event.target.value }))}
                    />
                  </label>

                  <div className="profile-edit-actions">
                    <button type="button" className="profile-secondary-button" onClick={handleCancelPreferences}>
                      CANCEL
                    </button>
                    <button type="button" className="profile-primary-button" onClick={handleSavePreferences}>
                      SAVE PREFERENCES
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* VIEW: NOTIFICATIONS */}
          {selectedSidebar === "notifications" && (
            <section className="profile-card profile-notifications-view">
              <div className="profile-card-header">
                <div>
                  <p className="profile-card-kicker">UPDATES</p>
                  <h2>NOTIFICATION PREFERENCES</h2>
                </div>
              </div>
              <p className="profile-subtitle">
                Choose which ritual updates, dispatch alerts, and tasting stories you want to receive.
              </p>

              <div className="profile-notif-list">
                {[
                  {
                    key: "orderUpdates" as const,
                    title: "Order & Delivery Status",
                    description: "Real-time shipping notifications, transit updates, and delivery confirmations.",
                  },
                  {
                    key: "ritualTips" as const,
                    title: "Artisan Brewing Rituals & Notes",
                    description: "Curated brewing advice, water temperature guides, and steeping methods.",
                  },
                  {
                    key: "newHarvestAlerts" as const,
                    title: "New Single-Origin Harvests",
                    description: "Be the first to hear when small-batch Darjeeling, Assam, or Nilgiri flushes arrive.",
                  },
                  {
                    key: "exclusiveVouchers" as const,
                    title: "Member Exclusive Vouchers",
                    description: "Seasonal discount vouchers, celebration gifts, and loyalty rewards.",
                  },
                ].map((item) => (
                  <div key={item.key} className="profile-notif-row">
                    <div className="profile-notif-info">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                    <label className="profile-switch">
                      <input
                        type="checkbox"
                        checked={notifications[item.key]}
                        onChange={() => handleToggleNotification(item.key)}
                      />
                      <span className="profile-switch-slider" />
                    </label>
                  </div>
                ))}
              </div>
              {notifSaved && <p className="profile-success-text">Notification settings updated.</p>}
            </section>
          )}

          {/* VIEW: SECURITY */}
          {selectedSidebar === "security" && (
            <section className="profile-card profile-security-view">
              <div className="profile-card-header">
                <div>
                  <p className="profile-card-kicker">AUTHENTICATION & PRIVACY</p>
                  <h2>ACCOUNT SECURITY</h2>
                </div>
                <span className="profile-security-badge">DEMO SESSION</span>
              </div>
              <p className="profile-subtitle">
                Overview of your current session integrity and account privacy protections.
              </p>

              <div className="profile-security-grid">
                <div className="profile-security-item">
                  <div className="profile-security-icon">🔒</div>
                  <div>
                    <h3>Session Protection</h3>
                    <p>This prototype runs on client-side state with zero third-party tracking or stored credentials.</p>
                  </div>
                </div>

                <div className="profile-security-item">
                  <div className="profile-security-icon">🛡️</div>
                  <div>
                    <h3>Future Backend Authentication</h3>
                    <p>Production releases will integrate OAuth2 & passwordless magic links. No passwords are collected here.</p>
                  </div>
                </div>

                <div className="profile-security-item">
                  <div className="profile-security-icon">📱</div>
                  <div>
                    <h3>Active Device</h3>
                    <p>Current Browser Session · Verified Local Workspace</p>
                  </div>
                </div>

                <div className="profile-security-item">
                  <div className="profile-security-icon">✦</div>
                  <div>
                    <h3>Privacy Standard</h3>
                    <p>Leafly respects your privacy. All preferences and local orders remain private to your browser.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* RECOMMENDATIONS */}
          <section className="profile-recommendations-card">
            <div className="profile-recommendations-image">
              <img src={image2} alt="Tea leaves and quiet morning ritual" loading="lazy" />
            </div>

            <div className="profile-recommendations-copy">
              <p className="profile-card-kicker">FOR YOU</p>
              <h2>Discover teas you&apos;ll love</h2>
              <p>
                Based on your preferences, we&apos;ll help you find teas that match your taste and mood.
              </p>
              <button type="button" className="profile-primary-button" onClick={handleExploreRecommendations}>
                EXPLORE RECOMMENDATIONS
              </button>
            </div>

            <div className="profile-recommendations-list">
              {recommendationItems.map((item) => {
                return (
                  <article key={item.id} className="profile-recommendation-item">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <div className="profile-recommendation-meta">
                      <p>{item.name}</p>
                      <span>{item.category}</span>
                      <div className="profile-recommendation-row">
                        <strong>{item.price}</strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* PROMISES */}
          <section className="profile-promises" aria-label="Leafly promises">
            {promiseItems.map((promise) => (
              <article key={promise.title} className="profile-promise-item">
                <span className="profile-promise-icon">{promise.icon}</span>
                <div>
                  <h3>{promise.title}</h3>
                  <p>{promise.text}</p>
                </div>
              </article>
            ))}
          </section>
        </section>
      </div>

      {showLogoutConfirm && (
        <div className="profile-logout-overlay" role="dialog" aria-modal="true" aria-label="Log out confirmation">
          <div className="profile-logout-modal">
            <p className="profile-card-kicker">ACCOUNT</p>
            <h3>Are you sure you want to log out?</h3>
            <div className="profile-logout-actions">
              <button type="button" className="profile-secondary-button" onClick={() => setShowLogoutConfirm(false)}>
                CANCEL
              </button>
              <button type="button" className="profile-primary-button" onClick={handleLogout}>
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      )}

      <button type="button" className="profile-back-to-top" onClick={handleBackToTop} aria-label="Back to top">
        ↑
      </button>

      <Footer />
    </main>
  );
}
