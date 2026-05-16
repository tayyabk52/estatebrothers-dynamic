"use client";
import { FileText, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAgent, houseListings, inventoryFilters, plotListings } from "@/data/inventory";

const tabs = [
  { id: "plots", label: "Plots for Sale" },
  { id: "houses", label: "Houses for Sale" },
];

interface Filters {
  search: string;
  phase: string;
  size: string;
  status: string;
}

function matchSearch(listing: Record<string, unknown>, agent: Record<string, unknown>, query: string) {
  if (!query) return true;
  const haystack = [
    listing.title,
    listing.phase,
    listing.project,
    listing.size,
    listing.price,
    listing.status,
    listing.city,
    agent.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function FilterBar({
  filters,
  setFilters,
  activeTab,
  setActiveTab,
  resultCount,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  activeTab: string;
  setActiveTab: (id: string) => void;
  resultCount: number;
}) {
  const update = (key: string, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section className="inventory-controls">
      <div className="wrap">
        <div className="inventory-tabs" role="tablist" aria-label="Listing type">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="inventory-filters" aria-label="Inventory filters">
          <label className="inventory-search">
            <span>Search</span>
            <input
              value={filters.search}
              onChange={(event) => update("search", event.target.value)}
              placeholder="Phase, project, title, contact"
            />
          </label>

          {(
            [
              ["phase", "Phase", inventoryFilters.phases],
              ["size", "Size", inventoryFilters.sizes],
              ["status", "Status", inventoryFilters.statuses],
            ] as [string, string, string[]][]
          ).map(([key, label, options]) => (
            <label className="inventory-select" key={key}>
              <span>{label}</span>
              <select
                value={filters[key as keyof Filters]}
                onChange={(event) => update(key, event.target.value)}
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <div className="inventory-count mono">{resultCount} shown</div>
        </div>
      </div>
    </section>
  );
}

function latestUpdatedAt(listings: { updatedAt?: string }[]) {
  return listings
    .map((listing) => listing.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function PlotTable({ listings }: { listings: typeof plotListings }) {
  const [openContactId, setOpenContactId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!openContactId) return undefined;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!tableRef.current?.contains(event.target as Node)) {
        setOpenContactId(null);
      }
    };

    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [openContactId]);

  const openListing = (slug: string) => router.push(`/buy-sell/plot/${slug}`);

  return (
    <div className="inventory-table-wrap" ref={tableRef}>
      <table className="inventory-table plots-table">
        <thead>
          <tr>
            <th>Phase</th>
            <th>Project</th>
            <th>Size</th>
            <th>Price</th>
            <th>Contact Person</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => {
            const agent = getAgent(listing.contactPersonId);
            return (
              <tr
                key={listing.id}
                className="clickable-row"
                tabIndex={0}
                onClick={() => openListing(listing.slug)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") openListing(listing.slug);
                }}
              >
                <td data-label="Phase">
                  <strong>{listing.phase}</strong>
                  <span>{listing.city}</span>
                </td>
                <td data-label="Project">{listing.project}</td>
                <td data-label="Size">{listing.size}</td>
                <td data-label="Price">{listing.price}</td>
                <td data-label="Contact Person" className="contact-col">
                  <strong>{agent.name}</strong>
                  <a
                    href={`tel:${agent.phone.replace(/\s/g, "")}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {agent.phone}
                  </a>
                </td>
                <td data-label="Action" className="action-cell">
                  <div className="action-inline">
                    <button
                      type="button"
                      className="contact-icon-btn"
                      aria-label={`Show contact for ${listing.phase}`}
                      aria-expanded={openContactId === listing.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenContactId((current) =>
                          current === listing.id ? null : listing.id
                        );
                      }}
                    >
                      <Phone size={13} strokeWidth={2.2} aria-hidden="true" />
                    </button>
                    <Link
                      href={`/buy-sell/plot/${listing.slug}`}
                      className="detail-link"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <FileText size={13} strokeWidth={2} aria-hidden="true" />
                      <span>Details</span>
                    </Link>
                  </div>
                  {openContactId === listing.id && (
                    <div
                      className="row-contact-popover"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <strong>{agent.name}</strong>
                      <span>{agent.role}</span>
                      <a href={`tel:${agent.phone.replace(/\s/g, "")}`}>{agent.phone}</a>
                      <a href={`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`}>WhatsApp</a>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HouseTable({ listings }: { listings: typeof houseListings }) {
  const [openContactId, setOpenContactId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!openContactId) return undefined;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!tableRef.current?.contains(event.target as Node)) {
        setOpenContactId(null);
      }
    };

    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => window.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [openContactId]);

  const openListing = (slug: string) => router.push(`/buy-sell/house/${slug}`);

  return (
    <div className="inventory-table-wrap" ref={tableRef}>
      <table className="inventory-table houses-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Phase / Location</th>
            <th>Size</th>
            <th>Beds</th>
            <th>Baths</th>
            <th>Price</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr
              key={listing.id}
              className="clickable-row"
              tabIndex={0}
              onClick={() => openListing(listing.slug)}
              onKeyDown={(event) => {
                if (event.key === "Enter") openListing(listing.slug);
              }}
            >
              <td data-label="Property">
                <strong>{listing.title}</strong>
                <span>{listing.id}</span>
              </td>
              <td data-label="Phase / Location">
                <strong>{listing.phase}</strong>
                <span>{listing.city}</span>
              </td>
              <td data-label="Size">{listing.size}</td>
              <td data-label="Beds" className="optional-col">
                {listing.bedrooms}
              </td>
              <td data-label="Baths" className="optional-col">
                {listing.bathrooms}
              </td>
              <td data-label="Price">{listing.price}</td>
              <td data-label="Status" className="optional-col">
                <span className="status-pill">{listing.status}</span>
              </td>
              <td data-label="Action" className="action-cell">
                <div className="action-inline">
                  <button
                    type="button"
                    className="contact-icon-btn"
                    aria-label={`Show contact for ${listing.title}`}
                    aria-expanded={openContactId === listing.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenContactId((current) =>
                        current === listing.id ? null : listing.id
                      );
                    }}
                  >
                    <Phone size={13} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                  <Link
                    href={`/buy-sell/house/${listing.slug}`}
                    className="detail-link"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <FileText size={13} strokeWidth={2} aria-hidden="true" />
                    <span>Details</span>
                  </Link>
                </div>
                {openContactId === listing.id && (
                  <div
                    className="row-contact-popover"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {(() => {
                      const agent = getAgent(listing.contactPersonId);
                      return (
                        <>
                          <strong>{agent.name}</strong>
                          <span>{agent.role}</span>
                          <a href={`tel:${agent.phone.replace(/\s/g, "")}`}>{agent.phone}</a>
                          <a href={`https://wa.me/${agent.whatsapp.replace(/\D/g, "")}`}>
                            WhatsApp
                          </a>
                        </>
                      );
                    })()}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="inventory-empty">
      <div className="serif-i">No listings match.</div>
      <p>Try a different phase, size, status, or search term.</p>
    </div>
  );
}

export function BuySellClient() {
  const [activeTab, setActiveTab] = useState("plots");
  const [filters, setFilters] = useState<Filters>({
    search: "",
    phase: "All",
    size: "All",
    status: "All",
  });

  const source = activeTab === "plots" ? plotListings : houseListings;
  const filtered = useMemo(
    () =>
      source.filter((listing) => {
        const agent = getAgent(listing.contactPersonId);
        return (
          matchSearch(
            listing as unknown as Record<string, unknown>,
            agent as unknown as Record<string, unknown>,
            filters.search
          ) &&
          (filters.phase === "All" || listing.phase === filters.phase) &&
          (filters.size === "All" || listing.size === filters.size) &&
          (filters.status === "All" || listing.status === filters.status)
        );
      }),
    [source, filters]
  );
  const updatedAt = latestUpdatedAt(source);

  return (
    <main>
      <section className="inventory-hero">
        <div className="wrap">
          <div className="inventory-hero-copy reveal">
            <div className="eyebrow">Buy / Sell</div>
            <h1>
              Search plots and houses with{" "}
              <span className="serif-i">clear market data.</span>
            </h1>
            <p>
              A compact inventory for comparing phases, sizes, prices, and contact persons. The
              current listings are demo data and structured for future Supabase-powered updates.
            </p>
          </div>
          <div className="inventory-hero-meta reveal">
            <span className="mono">Inventory</span>
            <strong>{plotListings.length + houseListings.length}</strong>
            <span>demo listings</span>
          </div>
        </div>
      </section>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        resultCount={filtered.length}
      />

      <section className="inventory-results">
        <div className="wrap">
          <div className="inventory-section-head reveal">
            <div>
              <h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
              <span className="inventory-updated mono">
                Updated at: {updatedAt || "Pending"}
              </span>
            </div>
            <p>Compact table view for fast comparison. Open a listing for complete details.</p>
          </div>

          {filtered.length > 0 ? (
            activeTab === "plots" ? (
              <PlotTable listings={filtered as typeof plotListings} />
            ) : (
              <HouseTable listings={filtered as typeof houseListings} />
            )
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </main>
  );
}
