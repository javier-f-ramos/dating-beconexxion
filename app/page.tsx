import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";

export default function Home() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <Hero />
      <HowItWorks />

      <footer className="text-center py-8 text-xs text-muted-foreground border-t border-border/40 mt-10">
        © 2026 Speed Dating Event. All rights reserved.
      </footer>
    </main>
  );
}
