import Image from "next/image";
import Link from "next/link";
import { BrandMark, StorysetCredit } from "@/components/Brand";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <BrandMark />
        <nav className="flex gap-3">
          <Link href="/signup" className="btn-primary text-sm animate-cta">
            Get started
          </Link>
        </nav>
      </header>

      <main className="flex-1 w-full">
        <section className="max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div className="text-left">
              <p className="text-sm font-medium tracking-[0.08em] uppercase text-accent-dim mb-4">
                Live commission tracking
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold tracking-tight leading-[1.08] text-navy max-w-xl">
                Commission updates,{" "}
                <span className="text-accent">in real time.</span>
              </h1>
              <p className="mt-5 text-text-secondary text-lg max-w-md leading-relaxed">
                Share a live status page with clients. Cut the &quot;any update?&quot; messages.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-primary text-base px-7 py-3">
                  Start free
                </Link>
                <Link href="#features" className="btn-ghost text-base px-7 py-3">
                  How it works
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <Image
                src="/assets/outer-space-rafiki.svg"
                alt="Artist exploring outer space while tracking commissions"
                width={640}
                height={640}
                priority
                className="w-full max-w-xl h-auto animate-float"
              />
            </div>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-navy mb-3">
            Built for commission workflows
          </h2>
          <p className="text-text-secondary max-w-xl mb-10 leading-relaxed">
            Queue, progress, and a single client link in one calm workspace.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              index="01"
              title="Live Progress"
              description="Status and percent complete update as you work, so clients always see where things stand."
              image="/assets/outer-space-amico.svg"
            />
            <FeatureCard
              index="02"
              title="Queue Position"
              description="Show clients exactly where they sit in line, so expectations stay clear."
              image="/assets/outer-space-bro.svg"
            />
            <FeatureCard
              index="03"
              title="Tracking Links"
              description="One private link to your queue. Clients open it anytime to check status and progress."
              image="/assets/solar-system-amico.svg"
            />
          </div>

        </section>
      </main>

      <footer className="border-t border-glass-border bg-bg-secondary/70">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            Orbit by Jupiter - art commissions, tracked live.
          </p>
          <StorysetCredit />
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({
  index,
  title,
  description,
  image,
}: {
  index: string;
  title: string;
  description: string;
  image: string;
}) => (
  <article className="glass rounded-2xl p-6 text-left h-full">
    <div className="flex items-start justify-between gap-3 mb-4">
      <p className="font-mono text-sm text-accent-dim tracking-wide">{index}</p>
      <Image src={image} alt="" width={96} height={96} className="w-20 h-20 object-contain" />
    </div>
    <h3 className="text-lg font-semibold text-navy mb-2 tracking-tight">{title}</h3>
    <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
  </article>
);


