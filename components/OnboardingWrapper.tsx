"use client";

import { useState, useEffect } from "react";
import OnboardingWizard from "./OnboardingWizard";

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const [settingsRes, contextRes] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/context"),
      ]);

      const settings = await settingsRes.json();
      const context = await contextRes.json();

      // Show wizard if onboarding not completed AND no company name set
      if (!settings.onboardingCompleted && !context.companyName) {
        setShowWizard(true);
      }
    } catch (error) {
      console.error("Failed to check onboarding status:", error);
    }
    setLoading(false);
  };

  const handleComplete = () => {
    setShowWizard(false);
    window.location.reload();
  };

  const handleSkip = async () => {
    // Mark onboarding as completed when skipped
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingCompleted: true }),
      });
    } catch (error) {
      console.error("Failed to mark onboarding as skipped:", error);
    }
    setShowWizard(false);
  };

  if (loading) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {showWizard && <OnboardingWizard onComplete={handleComplete} onSkip={handleSkip} />}
    </>
  );
}
