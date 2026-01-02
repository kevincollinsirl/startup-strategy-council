"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <button
        onClick={() => handleOutcome('success')}
        disabled={saving}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentOutcome === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-green-600/20'
        }`}
      >
        ✓ Success
      </button>
      <button
        onClick={() => handleOutcome('failure')}
        disabled={saving}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentOutcome === 'failure'
            ? 'bg-red-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-red-600/20'
        }`}
      >
        ✗ Failed
      </button>
      <button
        onClick={() => handleOutcome('pending')}
        disabled={saving}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          currentOutcome === 'pending'
            ? 'bg-yellow-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-yellow-600/20'
        }`}
      >
        ⏳ Pending
      </button>
    </div>
  );
}
