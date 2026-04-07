import Desktop from "@/features/desktop/components/Desktop";
import MobileLayout from "@/features/mobile/components/MobileLayout";

export default function Home() {
  return (
    <>
      {/* Desktop OS experience — visible at md+ (768px) */}
      <div className="hidden md:block h-screen w-screen">
        <Desktop />
      </div>
      {/* Mobile fallback — vertical card list */}
      <div className="block md:hidden">
        <MobileLayout />
      </div>
    </>
  );
}
