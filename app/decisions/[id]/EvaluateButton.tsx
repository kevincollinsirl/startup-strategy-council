"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompanyContext } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";

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
      <Button
        onClick={handleEvaluate}
        disabled={evaluating}
        size="lg"
        className="px-8 py-6 text-lg"
      >
        {evaluating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Evaluating...
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            Run Strategy Council
          </>
        )}
      </Button>
      {evaluating && (
        <div className="text-muted-foreground animate-pulse">
          <p>{progress}</p>
          <p className="text-sm mt-2">
            Running CFO, Growth, Risk, and Game Theory agents...
          </p>
        </div>
      )}
    </div>
  );
}
