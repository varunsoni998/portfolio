export default function ContactForm() {
  return (
    <form
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-2 p-6"
      // Intentionally not wired to a backend — this keeps the portfolio free
      // of unnecessary server infrastructure. Email above is the primary
      // contact path; connect this to a form service (Formspree, a
      // serverless function, etc.) later if you want a form instead.
      onSubmit={(e) => e.preventDefault()}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-2">
        Prefer email — but feel free to draft a message here.
      </p>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="micro-label">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="micro-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="micro-label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text outline-none focus:border-accent"
        />
      </div>
      <button type="submit" className="btn-primary mt-2 justify-center">
        Send message
      </button>
    </form>
  );
}
