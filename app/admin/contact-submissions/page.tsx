import type { Metadata } from "next";
import Link from "next/link";
import { getContactSubmissionsAdmin } from "@/lib/db/contact-submissions";
import { updateContactSubmissionStatus } from "./actions";

export const metadata: Metadata = { title: "Contact inquiries" };

const statuses = ["new", "read", "replied", "archived"] as const;

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

export default async function ContactSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = statuses.includes(status as (typeof statuses)[number]) ? status : undefined;
  const submissions = await getContactSubmissionsAdmin(activeStatus);

  return (
    <div className="admin-page admin-inquiries-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Client messages</p>
          <h1>Contact inquiries</h1>
          <p className="admin-page-subtitle">{submissions.length} {activeStatus ? activeStatus : "total"} inquiries, newest first.</p>
        </div>
        <Link href="/contact" className="admin-btn admin-btn-ghost" target="_blank">View contact page ↗</Link>
      </div>

      <nav className="admin-filter-row" aria-label="Filter inquiries">
        <Link className={!activeStatus ? "active" : ""} href="/admin/contact-submissions">All</Link>
        {statuses.map((item) => (
          <Link key={item} className={activeStatus === item ? "active" : ""} href={`/admin/contact-submissions?status=${item}`}>
            {item}
          </Link>
        ))}
      </nav>

      {submissions.length === 0 ? (
        <div className="admin-empty">
          <p>No contact inquiries found.</p>
          <span>New submissions from the public contact page will appear here automatically.</span>
        </div>
      ) : (
        <div className="admin-table-wrap admin-inquiries-table-wrap">
          <table className="admin-table admin-inquiries-table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Person</th>
                <th>Interest</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td data-label="Received">
                    <strong>{displayDate(submission.created_at)}</strong>
                    <span className="admin-cell-sub">{submission.reference}</span>
                  </td>
                  <td data-label="Person">
                    <strong>{submission.name}</strong>
                    <a href={`mailto:${submission.email}`}>{submission.email}</a>
                    {submission.phone && (
                      <span className="admin-inquiry-contact">
                        <a href={`tel:${submission.phone.replace(/[^\d+]/g, "")}`}>{submission.phone}</a>
                        <a href={`https://wa.me/${submission.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp ↗</a>
                      </span>
                    )}
                  </td>
                  <td data-label="Interest">
                    <strong>{submission.intent}</strong>
                    <span className="admin-cell-sub">{submission.city || "City not given"}</span>
                  </td>
                  <td data-label="Message">
                    <p className="admin-inquiry-message">{submission.message || "No message provided."}</p>
                  </td>
                  <td data-label="Status">
                    <form action={updateContactSubmissionStatus} className="admin-inquiry-status">
                      <input type="hidden" name="id" value={submission.id} />
                      <label className="sr-only" htmlFor={`status-${submission.id}`}>Status for {submission.name}</label>
                      <select id={`status-${submission.id}`} name="status" defaultValue={submission.status} aria-label={`Status for ${submission.name}`}>
                        {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                      </select>
                      <button type="submit">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

