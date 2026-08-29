import Link from "next/link";
import { getAllPublishedListings } from "@/lib/db/listings";
import { getAllSeoLandingPagesAdmin } from "@/lib/db/seo-admin";
import { listingMatchesSeoLandingPage } from "@/lib/db/seo";

export const metadata = {
  title: "SEO landing pages",
};

export default async function SeoLandingPagesAdminPage() {
  const [pages, listings] = await Promise.all([
    getAllSeoLandingPagesAdmin(),
    getAllPublishedListings(),
  ]);

  return (
    <div className="admin-stack">
      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="admin-kicker">SEO</p>
            <h1>Landing pages</h1>
          </div>
          <Link href="/admin/seo-landing-pages/new" className="admin-button">
            New landing page
          </Link>
        </div>
        <p className="admin-muted">
          Manage curated, search-focused pages that target useful property intents and automatically display relevant published listings.
        </p>
      </section>

      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>URL</th>
                <th>Status</th>
                <th>Indexing</th>
                <th>Public links</th>
                <th>Matches</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => {
                const matches = listings.filter((listing) => listingMatchesSeoLandingPage(listing, page)).length;
                const requestedPlacements = [
                  page.show_in_footer ? "Footer" : null,
                  page.show_on_home ? "Home" : null,
                  page.show_on_buy_sell ? "Buy/Sell" : null,
                ].filter(Boolean).join(", ");
                const placementsAreLive = page.status === "published" && !page.noindex;
                return (
                  <tr key={page.id}>
                    <td>
                      <Link href={`/admin/seo-landing-pages/${page.id}/edit`}>{page.title}</Link>
                      <span className="admin-subline">{page.page_type.replace("_", " ")}</span>
                    </td>
                    <td>
                      <a href={page.canonical_path} target="_blank" rel="noreferrer">
                        {page.canonical_path}
                      </a>
                    </td>
                    <td>{page.status}</td>
                    <td>{page.noindex ? "Noindex" : "Indexable"}</td>
                    <td>
                      {requestedPlacements ? (
                        <>
                          <span>{placementsAreLive ? requestedPlacements : "Inactive"}</span>
                          <span className="admin-subline">
                            {placementsAreLive
                              ? "Live public links"
                              : `Requested: ${requestedPlacements}. Publish and turn off noindex to display.`}
                          </span>
                        </>
                      ) : "None requested"}
                    </td>
                    <td>{matches}</td>
                    <td>{page.updated_at.slice(0, 10)}</td>
                  </tr>
                );
              })}
              {!pages.length ? (
                <tr>
                  <td colSpan={7}>No SEO landing pages have been created yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
