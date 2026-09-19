import Navbar from "./components/Navbar";
import OperationalRibbon from "./components/OperationalRibbon";
import HeroSection from "./components/HeroSection";
import ProblemSection from "./components/ProblemSection";
import HowItWorksSection from "./components/HowItWorksSection";
import VoiceDemoSection from "./components/VoiceDemoSection";
import ShopFloorDialectsSection from "./components/ShopFloorDialectsSection";
import CoreCapabilitiesSection from "./components/CoreCapabilitiesSection";
import InventoryIntelligenceSection from "./components/InventoryIntelligenceSection";
import RealWorldUseCasesSection from "./components/RealWorldUseCasesSection";
import ChallanScannerSection from "./components/ChallanScannerSection";
import TrustArchitectureSection from "./components/TrustArchitectureSection";
import AppPreviewSection from "./components/AppPreviewSection";
import FinalCTASection from "./components/FinalCTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[var(--surface)] text-[var(--text-primary)] pt-16">
      <Navbar />
      <main className="flex-grow w-full flex flex-col">
        <OperationalRibbon />
        <HeroSection />
        <VoiceDemoSection />
        <ProblemSection />
        <HowItWorksSection />
        <CoreCapabilitiesSection />
        <RealWorldUseCasesSection />
        <InventoryIntelligenceSection />
        <ChallanScannerSection />
        <ShopFloorDialectsSection />
        <TrustArchitectureSection />
        <AppPreviewSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
}
