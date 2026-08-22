"use client";
import { FileText, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NormalizedAgent, NormalizedHouse, NormalizedPlot } from "@/lib/types";
import { DEFAULT_AGENT } from "@/lib/types";

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

interface Props {
  plots: NormalizedPlot[];
  houses: NormalizedHouse[];
  agentMap: Record<string, NormalizedAgent>;
}

function getAgent(agentMap: Record<string, NormalizedAgent>, id: string | null): NormalizedAgent {
  return (id && agentMap[id]) ? agentMap[id] : DEFAULT_AGENT;
}

function matchSearch(
  listing: Record<string, unknown>,
  agent: NormalizedAgent,
  query: string
) {
  if (!query) return true;
  const haystack = [
    listing.phase,
    listing.project,
    listing.size,
    listing.price,
    listing.status,
    listing.city,
    listing.title,
    agent.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function buildFilterOptions(items: (NormalizedPlot | NormalizedHouse)[], key: keyof (NormalizedPlot & NormalizedHouse)): string[] {
  return ["All", ...new Set(items.map((i) => (i as unknown as Record<string, unknown>)[key as string]).filter(Boolean) as string[])];
}

function FilterBar({
  filters,
  setFilters,
  activeTab,
  setActiveTab,
  resultCount,
  phaseOptions,
  sizeOptions,
  statusOptions,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  activeTab: string;
  setActiveTab: (id: string) => void;
  resultCount: number;
  phaseOptions: string[];
  sizeOptions: string[];
  statusOptions: string[];
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
              onChange={(e) => update("search", e.target.value)}
              placeholder="Phase, project, title, contact"
            />
          </label>
          {(
            [
              ["phase", "Phase", phaseOptions],
              ["size", "Size", sizeOptions],
              ["status", "Status", statusOptions],
            ] as [string, string, string[]][]
          ).map(([key, label, options]) => (
            <label className="inventory-select" key={key}>
              <span>{label}</span>
              <select
                value={filters[key as keyof Filters]}
                onChange={(e) => update(key, e.target.value)}
              >
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
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
    .map((l) => l.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1);
}

function PlotTable({
  listings,
  agentMap,
}: {
  listings: NormalizedPlot[];
  agentMap: Record<string, NormalizedAgent>;
}) {
  const [openContactId, setOpenContactId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!openContactId) return undefined;
    const close = (e: PointerEvent) => {
      if (!tableRef.current?.contains(e.target as Node)) setOpenContactId(null);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
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
            const agent = getAgent(agentMap, listing.contactPersonId);
            return (
              <tr
                key={listing.id}
                className="clickable-row"
                tabIndex={0}
                onClick={() => openListing(listing.slug)}
                onKeyDown={(e) => { if (e.key === "Enter") openListing(listing.slug); }}
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
                  <a href={`tel:${agent.phone?.replace(/\s/g, "")}`} onClick={(e) => e.stopPropagation()}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenContactId((c) => (c === listing.id ? null : listing.id));
                      }}
                    >
                      <Phone size={13} strokeWidth={2.2} aria-hidden />
                    </button>
                    <Link href={`/buy-sell/plot/${listing.slug}`} className="detail-link" onClick={(e) => e.stopPropagation()}>
                      <FileText size={13} strokeWidth={2} aria-hidden />
                      <span>Details</span>
                    </Link>
                  </div>
                  {openContactId === listing.id && (
                    <div className="row-contact-popover" onClick={(e) => e.stopPropagation()}>
                      <strong>{agent.name}</strong>
                      <span>{agent.role}</span>
                      <a href={`tel:${agent.phone?.replace(/\s/g, "")}`}>{agent.phone}</a>
                      <a href={`https://wa.me/${agent.whatsapp?.replace(/\D/g, "")}`}>WhatsApp</a>
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

function HouseTable({
  listings,
  agentMap,
}: {
  listings: NormalizedHouse[];
  agentMap: Record<string, NormalizedAgent>;
}) {
  const [openContactId, setOpenContactId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!openContactId) return undefined;
    const close = (e: PointerEvent) => {
      if (!tableRef.current?.contains(e.target as Node)) setOpenContactId(null);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
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
          {listings.map((listing) => {
            const agent = getAgent(agentMap, listing.contactPersonId);
            return (
              <tr
                key={listing.id}
                className="clickable-row"
                tabIndex={0}
                onClick={() => openListing(listing.slug)}
                onKeyDown={(e) => { if (e.key === "Enter") openListing(listing.slug); }}
              >
                <td data-label="Property">
                  <strong>{listing.title}</strong>
                  <span className="mono">{listing.id.slice(0, 8)}</span>
                </td>
                <td data-label="Phase / Location">
                  <strong>{listing.phase}</strong>
                  <span>{listing.city}</span>
                </td>
                <td data-label="Size">{listing.size}</td>
                <td data-label="Beds" className="optional-col">{listing.bedrooms}</td>
                <td data-label="Baths" className="optional-col">{listing.bathrooms}</td>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenContactId((c) => (c === listing.id ? null : listing.id));
                      }}
                    >
                      <Phone size={13} strokeWidth={2.2} aria-hidden />
                    </button>
                    <Link href={`/buy-sell/house/${listing.slug}`} className="detail-link" onClick={(e) => e.stopPropagation()}>
                      <FileText size={13} strokeWidth={2} aria-hidden />
                      <span>Details</span>
                    </Link>
                  </div>
                  {openContactId === listing.id && (
                    <div className="row-contact-popover" onClick={(e) => e.stopPropagation()}>
                      <strong>{agent.name}</strong>
                      <span>{agent.role}</span>
                      <a href={`tel:${agent.phone?.replace(/\s/g, "")}`}>{agent.phone}</a>
                      <a href={`https://wa.me/${agent.whatsapp?.replace(/\D/g, "")}`}>WhatsApp</a>
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

function EmptyState() {
  return (
    <div className="inventory-empty">
      <div className="serif-i">No listings match.</div>
      <p>Try a different phase, size, status, or search term.</p>
    </div>
  );
}

export function BuySellClient({ plots, houses, agentMap }: Props) {
  const [activeTab, setActiveTab] = useState("plots");
  const [filters, setFilters] = useState<Filters>({
    search: "",
    phase: "All",
    size: "All",
    status: "All",
  });

  const source = activeTab === "plots" ? plots : houses;

  const phaseOptions = useMemo(
    () => buildFilterOptions(source, "phase"),
    [source]
  );
  const sizeOptions = useMemo(
    () => buildFilterOptions(source, "size"),
    [source]
  );
  const statusOptions = useMemo(
    () => buildFilterOptions(source, "status"),
    [source]
  );

  const filtered = useMemo(
    () =>
      source.filter((listing) => {
        const agent = getAgent(agentMap, listing.contactPersonId);
        return (
          matchSearch(listing as unknown as Record<string, unknown>, agent, filters.search) &&
          (filters.phase === "All" || listing.phase === filters.phase) &&
          (filters.size === "All" || listing.size === filters.size) &&
          (filters.status === "All" || listing.status === filters.status)
        );
      }),
    [source, filters, agentMap]
  );

  const updatedAt = latestUpdatedAt(source);
  const total = plots.length + houses.length;

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
              A compact inventory for comparing phases, sizes, prices, and contact persons.
            </p>
          </div>
          <div className="inventory-hero-meta reveal">
            <span className="mono">Inventory</span>
            <strong>{total}</strong>
            <span>selected listings</span>
          </div>
        </div>
      </section>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        resultCount={filtered.length}
        phaseOptions={phaseOptions}
        sizeOptions={sizeOptions}
        statusOptions={statusOptions}
      />

      <section className="inventory-results">
        <div className="wrap">
          <div className="inventory-section-head reveal">
            <div>
              <h2>{tabs.find((t) => t.id === activeTab)?.label}</h2>
              <span className="inventory-updated mono">
                Updated: {updatedAt ?? "Pending"}
              </span>
            </div>
            <p>Compact table view for fast comparison. Open a listing for complete details.</p>
          </div>
          {filtered.length > 0 ? (
            activeTab === "plots" ? (
              <PlotTable listings={filtered as NormalizedPlot[]} agentMap={agentMap} />
            ) : (
              <HouseTable listings={filtered as NormalizedHouse[]} agentMap={agentMap} />
            )
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </main>
  );
}
