"use client";

import { useState } from "react";
import { CompanyContext } from "@/lib/types";

interface ContextFormProps {
  initialContext: CompanyContext;
}

export default function ContextForm({ initialContext }: ContextFormProps) {
  const [context, setContext] = useState<CompanyContext>(initialContext);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newProject, setNewProject] = useState("");
  const [newAsset, setNewAsset] = useState("");
  const [newConstraint, setNewConstraint] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/context", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(context),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  };

  const addProject = () => {
    if (newProject.trim()) {
      setContext({
        ...context,
        activeProjects: [...context.activeProjects, newProject.trim()],
      });
      setNewProject("");
    }
  };

  const removeProject = (index: number) => {
    setContext({
      ...context,
      activeProjects: context.activeProjects.filter((_, i) => i !== index),
    });
  };

  const addAsset = () => {
    if (newAsset.trim()) {
      setContext({
        ...context,
        keyAssets: [...context.keyAssets, newAsset.trim()],
      });
      setNewAsset("");
    }
  };

  const removeAsset = (index: number) => {
    setContext({
      ...context,
      keyAssets: context.keyAssets.filter((_, i) => i !== index),
    });
  };

  const addConstraint = () => {
    if (newConstraint.trim()) {
      setContext({
        ...context,
        keyConstraints: [...context.keyConstraints, newConstraint.trim()],
      });
      setNewConstraint("");
    }
  };

  const removeConstraint = (index: number) => {
    setContext({
      ...context,
      keyConstraints: context.keyConstraints.filter((_, i) => i !== index),
    });
  };

  // Calculate runway
  const netBurn = context.monthlyBurn - context.monthlyRevenue;
  const runway = netBurn > 0 ? Math.round((context.monthlyRevenue * 12) / netBurn) : Infinity;

  return (
    <div className="space-y-6">
      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={context.companyName}
          onChange={(e) => setContext({ ...context, companyName: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Financial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Monthly Revenue (€)
          </label>
          <input
            type="number"
            value={context.monthlyRevenue}
            onChange={(e) => setContext({ ...context, monthlyRevenue: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Monthly Burn (€)
          </label>
          <input
            type="number"
            value={context.monthlyBurn}
            onChange={(e) => setContext({ ...context, monthlyBurn: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Team Size
          </label>
          <input
            type="number"
            value={context.teamSize}
            onChange={(e) => setContext({ ...context, teamSize: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Runway Display */}
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-400">Calculated Runway</p>
        <p className="text-2xl font-bold">
          {runway === Infinity ? "Profitable" : `${runway} months`}
        </p>
      </div>

      {/* Strategic Goal */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Strategic Goal
        </label>
        <select
          value={context.strategicGoal}
          onChange={(e) => setContext({ ...context, strategicGoal: e.target.value as 'valuation' | 'independence' | 'hybrid' })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
        >
          <option value="valuation">€100M+ Valuation (VC Path)</option>
          <option value="independence">Financial Independence</option>
          <option value="hybrid">Hybrid Approach</option>
        </select>
      </div>

      {/* Active Projects */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Active Projects
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProject()}
            placeholder="Add project..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addProject}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {context.activeProjects.map((project, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-gray-800 rounded-full text-sm flex items-center gap-2"
            >
              {project}
              <button
                onClick={() => removeProject(i)}
                className="text-gray-400 hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Key Assets */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Key Assets
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newAsset}
            onChange={(e) => setNewAsset(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addAsset()}
            placeholder="Add asset..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addAsset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {context.keyAssets.map((asset, i) => (
            <li
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg"
            >
              <span className="text-sm">{asset}</span>
              <button
                onClick={() => removeAsset(i)}
                className="text-gray-400 hover:text-red-400"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Constraints */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Key Constraints
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newConstraint}
            onChange={(e) => setNewConstraint(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addConstraint()}
            placeholder="Add constraint..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addConstraint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        <ul className="space-y-1">
          {context.keyConstraints.map((constraint, i) => (
            <li
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg"
            >
              <span className="text-sm">{constraint}</span>
              <button
                onClick={() => removeConstraint(i)}
                className="text-gray-400 hover:text-red-400"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
        >
          {saving ? "Saving..." : "Save Context"}
        </button>
        {saved && (
          <span className="text-green-400">Saved successfully!</span>
        )}
      </div>
    </div>
  );
}
