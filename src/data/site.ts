// Central place for personal info and links.

export const site = {
  name: "Varun Dhanak",
  role: "AI & Data Science Engineer",
  // Home.tsx renders this as a 3-line editorial headline with custom breaks
  // ("I build AI / from model / to product.") — kept here as plain text
  // too, e.g. for meta descriptions elsewhere.
  headline: "I build AI from model to product.",
  tagline:
    "Fourth-year AI & Data Science student building full-stack products across generative AI, RAG, computer vision, automation, and backend systems.",
  location: "India",
  education: {
    degree: "B.E. — Artificial Intelligence & Data Science",
    year: "4th Year",
    institution: "Vidyavardhini College of Engineering and Technology",
  },
  links: {
    github: "https://github.com/varunsoni998?tab=repositories",
    linkedin: "https://www.linkedin.com/in/varun-dhanak-522396215/",
    email: "mailto:varunsoni998@gmail.com",
  },
  // Drop the PDF at public/resume/Varun-Dhanak-Resume.pdf — this path will
  // then resolve. Until it exists, resume buttons show a "coming soon" state
  // instead of linking to a 404 (see hasResume below).
  resumeUrl: "/resume/Varun-Dhanak-Resume.pdf",
  // Flip to true once the PDF above actually exists in /public.
  hasResume: false,
};
