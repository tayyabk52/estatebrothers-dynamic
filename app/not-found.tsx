import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="wrap">
        <div className="eyebrow">404</div>
        <h1>Page not found.</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <Link href="/">Back to home</Link>
      </div>
    </div>
  );
}
