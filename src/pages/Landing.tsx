import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink">
      <Header />
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
