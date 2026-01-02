"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Option } from "@/lib/types";

export default function DecisionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<Option[]>([
    { id: uuidv4(), name: "", description: "", estimatedCost: 0, estimatedTimeWeeks: 1 },
    { id: uuidv4(), name: "", description: "", estimatedCost: 0, estimatedTimeWeeks: 1 },
  ]);
  const [saving, setSaving] = useState(false);

  const addOption = () => {
    setOptions([
      ...options,
      { id: uuidv4(), name: "", description: "", estimatedCost: 0, estimatedTimeWeeks: 1 },
    ]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((o) => o.id !== id));
    }
  };

  const updateOption = (id: string, field: keyof Option, value: string | number) => {
    setOptions(
      options.map((o) =>
        o.id === id ? { ...o, [field]: value } : o
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || options.some((o) => !o.name.trim())) {
      alert("Please fill in title and all option names");
      return;
    }

    setSaving(true);
    try {
      const decision = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        title: title.trim(),
        description: description.trim(),
        options: options.filter((o) => o.name.trim()),
      };

      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(decision),
      });

      if (res.ok) {
        router.push(`/decisions/${decision.id}`);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Decision Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Should we take VC funding?"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Context & Background
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the decision, its importance, and any relevant context..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Options */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-300">
            Options to Evaluate ({options.length})
          </label>
          <button
            type="button"
            onClick={addOption}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Add Option
          </button>
        </div>

        <div className="space-y-4">
          {options.map((option, index) => (
            <div
              key={option.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-400">
                  Option {index + 1}
                </span>
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(option.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) => updateOption(option.id, "name", e.target.value)}
                  placeholder="Option name *"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />

                <textarea
                  value={option.description}
                  onChange={(e) => updateOption(option.id, "description", e.target.value)}
                  placeholder="Describe this option..."
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Estimated Cost (€)
                    </label>
                    <input
                      type="number"
                      value={option.estimatedCost}
                      onChange={(e) => updateOption(option.id, "estimatedCost", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Time (weeks)
                    </label>
                    <input
                      type="number"
                      value={option.estimatedTimeWeeks}
                      onChange={(e) => updateOption(option.id, "estimatedTimeWeeks", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          {saving ? "Creating..." : "Create Decision"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
