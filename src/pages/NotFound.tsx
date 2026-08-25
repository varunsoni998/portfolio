import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="This page doesn't exist." path="/404" />
      <section className="container-content flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-2">404</p>
        <h1 className="mt-3 font-display text-display-md font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-muted">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-8">
          Back home
        </Link>
      </section>
    </>
  );
}
