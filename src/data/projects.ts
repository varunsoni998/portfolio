export type FeatureStatus = "implemented" | "in-development" | "planned";
export type ProjectStatus = "LIVE" | "IN DEVELOPMENT" | "EXPERIMENTAL";

export interface Feature {
  label: string;
  status: FeatureStatus;
}

export interface ArchitectureStage {
  label: string;
  detail?: string;
}

export interface ProjectLinks {
  demo: string | null;
  github: string | null;
}

export interface ScreenshotSlot {
  id: string;
  label: string; // e.g. "Dashboard", "CRM"
  src?: string; // populate once a real screenshot exists at this path
}

export interface Metric {
  label: string;
  value: string;
}

export interface EngineeringDecision {
  title: string;
  description: string;
}

export interface Project {
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  status: ProjectStatus;
  tech: string[];
  summary: string; // short card description
  links: ProjectLinks;
  featured: boolean;
  /** Only one project should be primary — it gets the large featured treatment. */
  primary?: boolean;

  overview: string;
  problem: string;
  solution: string;
  architecture: ArchitectureStage[];
  features: Feature[];
  engineeringDecisions?: EngineeringDecision[];
  challenges?: string[];
  results?: string;
  limitations?: string;
  /** Left empty/omitted until a metric is actually verified — the UI hides empty metrics. */
  metrics?: Metric[];
  screenshots: ScreenshotSlot[];
  future: string[];
}

export const projects: Project[] = [
  {
    slug: "businessos",
    name: "BusinessOS",
    subtitle: "Self-Hosted AI Business Operations Platform",
    category: "AI Platform / Full-Stack",
    status: "IN DEVELOPMENT",
    tech: ["React", "TypeScript", "FastAPI", "PostgreSQL", "n8n", "RAG", "Ollama"],
    summary:
      "BusinessOS is a business operations platform I'm building around CRM, AI assistants, RAG, automation, content generation, and self-hosted company data.",
    links: { demo: "https://businessos-roan-iota.vercel.app/", github: null },
    featured: true,
    primary: true,

    overview:
      "BusinessOS is a self-hosted business operations platform: a company installs a BusinessOS Server on its own infrastructure and its employees work through a hosted web client. The long-term goal is a single system that replaces a patchwork of CRM, automation, and AI tools with one configurable core.",
    problem:
      "Small businesses stitch together a CRM, a handful of automation tools, and separate AI subscriptions — each with its own login, its own data model, and no shared context. Migrating existing CRM data into a new system is usually manual and error-prone.",
    solution:
      "Design a canonical data model for leads, staff, and suppliers that other systems can migrate into, then layer AI assistants and automation (RAG-based retrieval, content generation, n8n workflows) directly on top of that shared data, rather than bolting AI onto disconnected tools.",
    architecture: [
      { label: "Employee", detail: "End user, in the browser" },
      { label: "BusinessOS Web", detail: "Employee-facing client" },
      { label: "Cloud Control Plane", detail: "Auth, provisioning, routing" },
      { label: "Secure Connection", detail: "Encrypted tunnel to the customer's server" },
      { label: "BusinessOS Server", detail: "Self-hosted on company infrastructure" },
      { label: "PostgreSQL", detail: "Company data, kept on-prem" },
      { label: "AI / RAG / n8n", detail: "Assistants, retrieval, workflow automation" },
    ],
    features: [
      { label: "CRM — lead management", status: "in-development" },
      { label: "Staff management", status: "in-development" },
      { label: "Supplier management", status: "planned" },
      { label: "Role-based access control", status: "in-development" },
      { label: "CRM migration tooling", status: "in-development" },
      { label: "RAG-based AI assistant", status: "in-development" },
      { label: "AI content generation (text)", status: "planned" },
      { label: "AI image generation", status: "planned" },
      { label: "AI video generation", status: "planned" },
      { label: "n8n workflow automation", status: "in-development" },
      { label: "Business-card scanning", status: "planned" },
      { label: "Self-hosted deployment (BusinessOS Server)", status: "in-development" },
    ],
    engineeringDecisions: [
      {
        title: "Canonical CRM Schema",
        description:
          "Designed around a canonical CRM structure so different business data sources can be mapped into a consistent application model.",
      },
      {
        title: "Self-Hosted Company Data",
        description:
          "Designed so operational company data can remain on the company's BusinessOS Server rather than requiring all business data to live in a central cloud database.",
      },
      {
        title: "Cloud Control Plane",
        description:
          "Use cloud infrastructure for authentication, server registration, connectivity and coordination while keeping the primary business database under the company's control.",
      },
      {
        title: "Role-Based Access Control",
        description: "Permissions are enforced server-side rather than relying only on frontend visibility.",
      },
    ],
    challenges: [
      "Designing a canonical CRM schema flexible enough to receive migrated data from different existing systems without losing fidelity.",
      "Splitting responsibilities cleanly between a cloud control plane (auth, routing) and a self-hosted server that holds the customer's actual data.",
      "Keeping the RAG pipeline scoped to a single company's data when the platform is architected to serve many self-hosted deployments.",
    ],
    limitations:
      "The system is under active development. CRM core, migration tooling, and the assistant/RAG layer are furthest along; generation features and business-card scanning have not been built yet.",
    metrics: [],
    screenshots: [
      { id: "dashboard", label: "Dashboard" },
      { id: "crm", label: "CRM" },
      { id: "leads", label: "Lead Management" },
      { id: "assistant", label: "AI Assistant" },
      { id: "rag", label: "RAG" },
      { id: "creative", label: "Creative Generation" },
      { id: "automations", label: "Automations" },
      { id: "server", label: "Server Dashboard" },
    ],
    future: [
      "Finish the CRM migration workflow for at least one common external CRM export format.",
      "Ship a first working RAG assistant scoped to a company's CRM and document data.",
      "Add AI content and image generation once the core platform is stable.",
    ],
  },
  {
    slug: "pan-fraud-detection",
    name: "Fraud PAN Card Detection",
    subtitle: "Computer Vision + OCR Fraud Detection System",
    category: "Computer Vision / AI",
    status: "EXPERIMENTAL",
    tech: ["Python", "PyTorch", "OpenCV", "Tesseract OCR", "CNN"],
    summary:
      "A computer-vision and OCR pipeline that extracts fields from PAN card images and flags likely forgeries.",
    links: { demo: null, github: null },
    featured: true,

    overview:
      "An AI/computer-vision system for detecting forged PAN (Permanent Account Number) cards — a document commonly used for identity verification in India. The pipeline combines image preprocessing, OCR field extraction, and a classification stage that scores forgery likelihood.",
    problem:
      "PAN cards are widely used for identity verification, and manual visual review of scanned or photographed cards is slow and inconsistent. Fraud indicators — font irregularities, tampered fields, inconsistent layouts — are easy for a trained model to check but tedious to check by eye at scale.",
    solution:
      "Preprocess the input image, extract text fields with OCR, extract visual features from the document, and classify the result as genuine or likely-fraudulent using a CNN-based classifier trained on the extracted features.",
    architecture: [
      { label: "PAN Image", detail: "Uploaded scan or photo" },
      { label: "Image Preprocessing", detail: "Denoising, alignment, cropping" },
      { label: "OCR / Vision", detail: "Field extraction (Tesseract)" },
      { label: "Feature Extraction", detail: "Layout + visual features" },
      { label: "Classifier", detail: "CNN — genuine vs. tampered" },
      { label: "Fraud Analysis", detail: "Rule + model-based decision" },
      { label: "Result", detail: "Verdict with confidence" },
    ],
    features: [
      { label: "Image preprocessing pipeline", status: "implemented" },
      { label: "OCR field extraction", status: "implemented" },
      { label: "CNN-based classification", status: "implemented" },
      { label: "Fraud decision logic", status: "in-development" },
      { label: "Batch processing", status: "planned" },
    ],
    challenges: [
      "Getting OCR to extract fields reliably from low-quality phone photos rather than clean scans.",
      "Separating genuine variation in card printing/lighting from actual signs of tampering.",
    ],
    results: "Evaluation results will be added after final validation.",
    limitations:
      "Trained and tested on a synthetic/demo dataset rather than a large verified real-world corpus, so current results should be read as early-stage, not production-grade.",
    metrics: [],
    screenshots: [
      { id: "upload", label: "Upload Interface" },
      { id: "detection", label: "Detection Result" },
      { id: "ocr", label: "OCR Output" },
      { id: "classification", label: "Classification Result" },
    ],
    future: [
      "Evaluate on a larger, verified dataset and publish real accuracy/precision/recall/F1 numbers.",
      "Add tamper-localization (highlighting which region of the card triggered a flag) instead of a single verdict.",
      "Package the pipeline behind a simple API for integration testing.",
    ],
  },
  {
    slug: "mechago",
    name: "MechaGO",
    subtitle: "On-Demand Mechanic Platform",
    category: "Mobile / Full-Stack",
    status: "IN DEVELOPMENT",
    tech: ["Flutter", "FastAPI", "PostgreSQL"],
    summary:
      "A mobile app connecting customers who need vehicle repairs with nearby mechanics, backed by a FastAPI service and PostgreSQL data layer.",
    links: { demo: null, github: null },
    featured: true,

    overview:
      "MechaGO is a mobile marketplace connecting customers with mechanics on demand — a Flutter client talking to a FastAPI backend, backed by PostgreSQL.",
    problem:
      "Finding a trustworthy mechanic on short notice usually means asking around or searching generic listings with no structured booking flow.",
    solution:
      "Build a mobile app where customers can request a mechanic and a backend service that manages accounts, requests, and matching, on top of a relational schema for users, requests, and mechanics.",
    architecture: [
      { label: "Flutter", detail: "Customer + mechanic mobile app" },
      { label: "FastAPI", detail: "REST backend, auth, matching logic" },
      { label: "PostgreSQL", detail: "Users, requests, mechanic records" },
    ],
    features: [
      { label: "Customer account + auth", status: "in-development" },
      { label: "Mechanic account + auth", status: "in-development" },
      { label: "Service request flow", status: "in-development" },
      { label: "Mechanic matching", status: "planned" },
      { label: "In-app payments", status: "planned" },
      { label: "Ratings and reviews", status: "planned" },
    ],
    challenges: [
      "Designing a request/matching data model that works for both the customer and mechanic sides of the same flow.",
      "Structuring the FastAPI backend so auth and request-handling stay decoupled as features are added incrementally.",
    ],
    limitations:
      "Core account and request flows are in progress; matching, payments, and reviews are not built yet. Not yet ready for real users.",
    metrics: [],
    screenshots: [
      { id: "login", label: "Login" },
      { id: "home", label: "Home" },
      { id: "request", label: "Request Mechanic" },
      { id: "mechanic-view", label: "Mechanic View" },
      { id: "booking", label: "Booking" },
    ],
    future: [
      "Finish the end-to-end request flow from a customer's first request to a mechanic accepting it.",
      "Add location-based matching.",
      "Pilot with a small group of real mechanics before adding payments.",
    ],
  },
];

export function getProjectBySlug(slug: string | undefined) {
  return projects.find((p) => p.slug === slug);
}

export const primaryProject = projects.find((p) => p.primary)!;
export const secondaryProjects = projects.filter((p) => !p.primary);
