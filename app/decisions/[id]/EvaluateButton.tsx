"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompanyContext } from "@/lib/types";

interface EvaluateButtonProps {
  decisionId: string;
  context: CompanyContext;
}

export default function EvaluateButton({ decisionId, context }: EvaluateButtonProps) {
  const router = useRouter();
  const [evaluating, setEvaluating] = useState(false);
  const [progress, setProgress] = useState("");

  const handleEvaluate = async () => {
    if (!context.companyName) {
      alert("Please set up your company context first");
      router.push("/context");
      return;
    }

    setEvaluating(true);
    setProgress("Starting council evaluation...");

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId }),
      });

      if (res.ok) {
        setProgress("Evaluation complete!");
        router.refresh();
      } else {
        const error = await res.json();
        alert(`Evaluation failed: ${error.error}`);
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      alert("Failed to run evaluation");
    }

    setEvaluating(false);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleEvaluate}
        disabled={evaluating}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium text-lg transition-colors"
      >
        {evaluating ? "Evaluating..." : "Run Strategy Council"}
      </button>
      {evaluating && (
        <div className="text-gray-400 animate-pulse">
          <p>{progress}</p>
          <p className="text-sm mt-2">
            Running CFO, Growth, Risk, and Game Theory agents...
          </p>
        </div>
      )}
    </div>
  );
}
