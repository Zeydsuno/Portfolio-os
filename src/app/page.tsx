"use client";

import { useEffect, useState } from "react";
import Desktop from "@/features/desktop/components/Desktop";
import MobileLayout from "@/features/mobile/components/MobileLayout";

export default function Home() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLayout = () => {
      // Consider mobile if width is < 768px OR height is < 500px
      const mobile = window.innerWidth < 768 || window.innerHeight < 500;
      setIsMobile(mobile);
    };

    checkLayout();
    window.addEventListener("resize", checkLayout);
    return () => window.removeEventListener("resize", checkLayout);
  }, []);

  // Use a blank Windows 98 boot background color during hydration to avoid flash shifts
  if (isMobile === null) {
    return (
      <div style={{ background: "#000080", width: "100vw", height: "100vh" }} />
    );
  }

  return (
    <>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <div className="h-screen w-screen">
          <Desktop />
        </div>
      )}
    </>
  );
}
