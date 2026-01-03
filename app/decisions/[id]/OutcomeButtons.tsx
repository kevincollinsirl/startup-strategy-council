"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from "lucide-react";

interface OutcomeButtonsProps {
  decisionId: string;
  currentOutcome?: 'success' | 'failure' | 'pending';
}

export default function OutcomeButtons({ decisionId, currentOutcome }: OutcomeButtonsProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleOutcome = async (outcome: 'success' | 'failure' | 'pending') => {
    setSaving(true);
    try {
      const res = await fetch(`/api/decisions/${decisionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to update outcome:", err);
    }
    setSaving(false);
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={() => handleOutcome('success')}
        disabled={saving}
        variant={currentOutcome === 'success' ? 'default' : 'secondary'}
        className="gap-2"
      >
        <span className={`w-2 h-2 rounded-full ${currentOutcome === 'success' ? 'bg-white' : 'bg-emerald-500'}`} />
        Success
      </Button>
      <Button
        onClick={() => handleOutcome('failure')}
        disabled={saving}
        variant={currentOutcome === 'failure' ? 'default' : 'secondary'}
        className="gap-2"
      >
        <span className={`w-2 h-2 rounded-full ${currentOutcome === 'failure' ? 'bg-white' : 'bg-red-500'}`} />
        Failed
      </Button>
      <Button
        onClick={() => handleOutcome('pending')}
        disabled={saving}
        variant={currentOutcome === 'pending' ? 'default' : 'secondary'}
        className="gap-2"
      >
        <span className={`w-2 h-2 rounded-full ${currentOutcome === 'pending' ? 'bg-white' : 'bg-muted-foreground'}`} />
        Pending
      </Button>
    </div>
  );
}
