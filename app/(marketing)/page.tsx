import { Nav } from "./_components/Nav";
import { Hero } from "./_components/Hero";
import { ProPillars } from "./_components/ProPillars";
import { ClientFeatures } from "./_components/ClientFeatures";
import { Ecosystem } from "./_components/Ecosystem";
import { FinalCta } from "./_components/FinalCta";
import { Footer } from "./_components/Footer";

export const metadata = {
  title: "KORE · Super App de saúde, fitness e nutrição",
  description:
    "Treino, nutrição e marketplace local em um só app. Para clientes, personal trainers, nutricionistas e lojistas.",
};

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-kore-bg text-kore-ink">
      <Nav />
      <Hero />
      <ProPillars />
      <ClientFeatures />
      <Ecosystem />
      <FinalCta />
      <Footer />
    </div>
  );
}
