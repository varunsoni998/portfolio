import Seo from "@/components/Seo";
import Reveal from "@/components/Reveal";
import AIToolCard from "@/components/AIToolCard";
import { aiLabTools } from "@/data/aiLabTools";

export default function Lab() {
  return (
    <>
      <Seo
        title="AI Lab"
        description="Interactive AI systems you can actually try — image and video generation, chat, document Q&A, business-card scanning, and content generation."
        path="/lab"
      />

      <section className="border-b border-border py-16 md:py-20">
        <div className="container-content">
          <p className="eyebrow">AI Lab</p>
          <h1 className="mt-4 font-display text-display-lg font-semibold text-text">Interactive systems you can actually try.</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            AI systems and experiments I've built and deployed — some running on my own GPU, some
            calling out to an LLM API. Every tool below is labeled honestly: what's live, what's a
            demo, and what's still coming.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container-content">
          {aiLabTools.map((tool, i) => (
            <Reveal key={tool.slug} delay={i * 60}>
              <AIToolCard tool={tool} index={i + 1} total={aiLabTools.length} />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
