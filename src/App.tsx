import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Work from "@/pages/Work";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import ProjectDetail from "@/pages/ProjectDetail";
import Lab from "@/pages/Lab";
import ImageGenerator from "@/pages/lab/ImageGenerator";
import VideoGenerator from "@/pages/lab/VideoGenerator";
import Chat from "@/pages/lab/Chat";
import ChatWithPdf from "@/pages/lab/ChatWithPdf";
import BusinessCardScanner from "@/pages/lab/BusinessCardScanner";
import ContentGenerator from "@/pages/lab/ContentGenerator";
import NotFound from "@/pages/NotFound";
import MorphingGlow from "@/components/MorphingGlow";

/**
 * Handles scroll position on every navigation.
 *
 * No hash -> scroll to top. Hash present -> scroll to that section once the
 * destination route has mounted (relevant when navigating from another
 * route, e.g. a project or lab page, back to "/#work").
 */
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

    if (!hash) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const id = hash.slice(1);
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior, block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    // Background gradient lives on <body> (see index.css) — this wrapper
    // stays transparent so it shows through. MorphingGlow is absolutely
    // positioned within this wrapper (page-relative, not viewport-fixed)
    // so it stays anchored to the hero as the page scrolls, peeking
    // through the card's margins — see that component for why.
    <div className="relative min-h-screen">
      <ScrollManager />

      <MorphingGlow />

      {/*
        The floating portfolio surface. Responsive margins do the "floating"
        work (large on desktop, smaller on tablet, ~full-bleed on mobile);
        rounded corners + a soft shadow read as an elevated canvas rather
        than a fake browser window. Deliberately NOT overflow-hidden — that
        would clip rounded corners cleanly, but it also breaks `sticky`
        positioning on the nav inside it (any ancestor with overflow set
        breaks position:sticky). Full-bleed media inside gets its own
        rounded corners instead of relying on the shell to clip them.
      */}
      <div className="relative mx-2 my-2 rounded-surface border border-border bg-surface shadow-surface sm:mx-4 sm:my-4 md:mx-10 md:my-6 lg:mx-16 lg:my-8">
        <div className="flex min-h-[calc(100vh-1rem)] flex-col sm:min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
          <Nav />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/work" element={<Work />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/lab" element={<Lab />} />
              <Route path="/lab/image" element={<ImageGenerator />} />
              <Route path="/lab/video" element={<VideoGenerator />} />
              <Route path="/lab/chat" element={<Chat />} />
              <Route path="/lab/pdf" element={<ChatWithPdf />} />
              <Route path="/lab/business-card" element={<BusinessCardScanner />} />
              <Route path="/lab/content" element={<ContentGenerator />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
