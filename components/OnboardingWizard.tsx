"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Building,
  Euro,
  Building2,
  Users,
  Cpu,
  Terminal,
  ChevronRight,
  ChevronLeft,
  Loader2,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { AIProvider, OpenAIModel, BusinessArm, Competitor } from "@/lib/types";

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface WizardData {
  companyName: string;
  teamSize: number;
  strategicGoal: "valuation" | "independence" | "hybrid";
  monthlyRevenue: number;
  monthlyBurn: number;
  keyAssets: string[];
  keyConstraints: string[];
  arms: Partial<BusinessArm>[];
  tam: number;
  sam: number;
  som: number;
  competitors: Partial<Competitor>[];
  marketTrends: string[];
  aiProvider: AIProvider;
  openaiApiKey: string;
  openaiModel: OpenAIModel;
}

const STEPS = [
  { id: "welcome", title: "Welcome", icon: Target },
  { id: "basics", title: "Company", icon: Building },
  { id: "financials", title: "Financials", icon: Euro },
  { id: "arms", title: "Business Arms", icon: Building2 },
  { id: "market", title: "Market", icon: Users },
  { id: "ai", title: "AI Setup", icon: Cpu },
  { id: "complete", title: "Complete", icon: Target },
];

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<WizardData>({
    companyName: "",
    teamSize: 1,
    strategicGoal: "valuation",
    monthlyRevenue: 0,
    monthlyBurn: 0,
    keyAssets: [],
    keyConstraints: [],
    arms: [],
    tam: 0,
    sam: 0,
    som: 0,
    competitors: [],
    marketTrends: [],
    aiProvider: "claude-cli",
    openaiApiKey: "",
    openaiModel: "gpt-4o",
  });

  const [newAsset, setNewAsset] = useState("");
  const [newConstraint, setNewConstraint] = useState("");
  const [newTrend, setNewTrend] = useState("");

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      // Calculate runway
      const netBurn = data.monthlyBurn - data.monthlyRevenue;
      const runwayMonths = netBurn > 0 ? Math.round((data.monthlyRevenue * 12) / netBurn) : 0;

      // Prepare arms with IDs
      const arms: BusinessArm[] = data.arms
        .filter((a) => a.name)
        .map((a, i) => ({
          id: `arm-${Date.now()}-${i}`,
          name: a.name || "",
          description: a.description || "",
          monthlyRevenue: a.monthlyRevenue || 0,
          monthlyCosts: a.monthlyCosts || 0,
          timeInvestmentHours: a.timeInvestmentHours || 0,
          strategicValue: a.strategicValue || 5,
          status: (a.status as "active" | "paused" | "planned") || "active",
          dependencies: [],
        }));

      // Prepare competitors with IDs
      const competitors: Competitor[] = data.competitors
        .filter((c) => c.name)
        .map((c, i) => ({
          id: `comp-${Date.now()}-${i}`,
          name: c.name || "",
          description: c.description || "",
          strengths: c.strengths || [],
          weaknesses: c.weaknesses || [],
          marketShare: c.marketShare || 0,
          threat: (c.threat as "low" | "medium" | "high") || "medium",
        }));

      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            companyName: data.companyName,
            monthlyRevenue: data.monthlyRevenue,
            monthlyBurn: data.monthlyBurn,
            teamSize: data.teamSize,
            runwayMonths,
            activeProjects: [],
            strategicGoal: data.strategicGoal,
            keyAssets: data.keyAssets,
            keyConstraints: data.keyConstraints,
          },
          arms,
          market: {
            tam: data.tam,
            sam: data.sam,
            som: data.som,
            marketTrends: data.marketTrends,
            competitors,
          },
          settings: {
            aiProvider: data.aiProvider,
            openaiApiKey: data.openaiApiKey,
            openaiModel: data.openaiModel,
          },
        }),
      });

      onComplete();
    } catch (error) {
      console.error("Failed to save onboarding data:", error);
    }
    setSaving(false);
  };

  const addArm = () => {
    setData({
      ...data,
      arms: [...data.arms, { name: "", monthlyRevenue: 0, monthlyCosts: 0, status: "active" }],
    });
  };

  const updateArm = (index: number, updates: Partial<BusinessArm>) => {
    const newArms = [...data.arms];
    newArms[index] = { ...newArms[index], ...updates };
    setData({ ...data, arms: newArms });
  };

  const removeArm = (index: number) => {
    setData({ ...data, arms: data.arms.filter((_, i) => i !== index) });
  };

  const addCompetitor = () => {
    setData({
      ...data,
      competitors: [...data.competitors, { name: "", threat: "medium", marketShare: 0 }],
    });
  };

  const updateCompetitor = (index: number, updates: Partial<Competitor>) => {
    const newCompetitors = [...data.competitors];
    newCompetitors[index] = { ...newCompetitors[index], ...updates };
    setData({ ...data, competitors: newCompetitors });
  };

  const removeCompetitor = (index: number) => {
    setData({ ...data, competitors: data.competitors.filter((_, i) => i !== index) });
  };

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case "welcome":
        return (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Startup Strategy Council</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                A multi-agent AI system that helps you make strategic business decisions.
                Let&apos;s set up your company profile.
              </p>
            </div>
            <div className="pt-4">
              <Button onClick={handleNext} className="gap-2">
                Get Started
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case "basics":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={data.companyName}
                onChange={(e) => setData({ ...data, companyName: e.target.value })}
                placeholder="Your company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <Input
                id="teamSize"
                type="number"
                min={1}
                value={data.teamSize}
                onChange={(e) => setData({ ...data, teamSize: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Strategic Goal</Label>
              <Select
                value={data.strategicGoal}
                onValueChange={(value) =>
                  setData({ ...data, strategicGoal: value as "valuation" | "independence" | "hybrid" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valuation">High Valuation (VC Path)</SelectItem>
                  <SelectItem value="independence">Financial Independence</SelectItem>
                  <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "financials":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenue">Monthly Revenue (EUR)</Label>
                <Input
                  id="revenue"
                  type="number"
                  min={0}
                  value={data.monthlyRevenue}
                  onChange={(e) => setData({ ...data, monthlyRevenue: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burn">Monthly Burn (EUR)</Label>
                <Input
                  id="burn"
                  type="number"
                  min={0}
                  value={data.monthlyBurn}
                  onChange={(e) => setData({ ...data, monthlyBurn: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Key Assets</Label>
              <div className="flex gap-2">
                <Input
                  value={newAsset}
                  onChange={(e) => setNewAsset(e.target.value)}
                  placeholder="e.g., Proprietary technology"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAsset.trim()) {
                      setData({ ...data, keyAssets: [...data.keyAssets, newAsset.trim()] });
                      setNewAsset("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (newAsset.trim()) {
                      setData({ ...data, keyAssets: [...data.keyAssets, newAsset.trim()] });
                      setNewAsset("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.keyAssets.map((asset, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm"
                  >
                    {asset}
                    <button
                      onClick={() =>
                        setData({ ...data, keyAssets: data.keyAssets.filter((_, j) => j !== i) })
                      }
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Key Constraints</Label>
              <div className="flex gap-2">
                <Input
                  value={newConstraint}
                  onChange={(e) => setNewConstraint(e.target.value)}
                  placeholder="e.g., Limited engineering bandwidth"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newConstraint.trim()) {
                      setData({ ...data, keyConstraints: [...data.keyConstraints, newConstraint.trim()] });
                      setNewConstraint("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (newConstraint.trim()) {
                      setData({ ...data, keyConstraints: [...data.keyConstraints, newConstraint.trim()] });
                      setNewConstraint("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.keyConstraints.map((constraint, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm"
                  >
                    {constraint}
                    <button
                      onClick={() =>
                        setData({ ...data, keyConstraints: data.keyConstraints.filter((_, j) => j !== i) })
                      }
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case "arms":
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add your business verticals or revenue streams. You can skip this and add them later.
            </p>
            {data.arms.map((arm, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Business Arm {i + 1}</Label>
                  <Button variant="ghost" size="sm" onClick={() => removeArm(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Name (e.g., Core SaaS Product)"
                  value={arm.name || ""}
                  onChange={(e) => updateArm(i, { name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Monthly Revenue"
                    value={arm.monthlyRevenue || ""}
                    onChange={(e) => updateArm(i, { monthlyRevenue: parseInt(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Monthly Costs"
                    value={arm.monthlyCosts || ""}
                    onChange={(e) => updateArm(i, { monthlyCosts: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addArm} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Business Arm
            </Button>
          </div>
        );

      case "market":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Market Size (EUR)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">TAM</Label>
                  <Input
                    type="number"
                    placeholder="Total Addressable"
                    value={data.tam || ""}
                    onChange={(e) => setData({ ...data, tam: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">SAM</Label>
                  <Input
                    type="number"
                    placeholder="Serviceable"
                    value={data.sam || ""}
                    onChange={(e) => setData({ ...data, sam: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">SOM</Label>
                  <Input
                    type="number"
                    placeholder="Obtainable"
                    value={data.som || ""}
                    onChange={(e) => setData({ ...data, som: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Market Trends</Label>
              <div className="flex gap-2">
                <Input
                  value={newTrend}
                  onChange={(e) => setNewTrend(e.target.value)}
                  placeholder="e.g., Growing demand for AI solutions"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTrend.trim()) {
                      setData({ ...data, marketTrends: [...data.marketTrends, newTrend.trim()] });
                      setNewTrend("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (newTrend.trim()) {
                      setData({ ...data, marketTrends: [...data.marketTrends, newTrend.trim()] });
                      setNewTrend("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.marketTrends.map((trend, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-sm"
                  >
                    {trend}
                    <button
                      onClick={() =>
                        setData({ ...data, marketTrends: data.marketTrends.filter((_, j) => j !== i) })
                      }
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Competitors</Label>
              {data.competitors.map((comp, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Competitor name"
                    value={comp.name || ""}
                    onChange={(e) => updateCompetitor(i, { name: e.target.value })}
                  />
                  <Select
                    value={(comp.threat as string) || "medium"}
                    onValueChange={(value) =>
                      updateCompetitor(i, { threat: value as "low" | "medium" | "high" })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => removeCompetitor(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addCompetitor} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Add Competitor
              </Button>
            </div>
          </div>
        );

      case "ai":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>AI Provider</Label>
              <RadioGroup
                value={data.aiProvider}
                onValueChange={(value) => setData({ ...data, aiProvider: value as AIProvider })}
                className="grid grid-cols-1 gap-4"
              >
                <Label
                  htmlFor="claude-cli-onboard"
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer ${
                    data.aiProvider === "claude-cli" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="claude-cli" id="claude-cli-onboard" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Terminal className="h-4 w-4" />
                      <span className="font-medium">Claude CLI (Recommended)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Uses Claude Code CLI. No API key needed if CLI is installed.
                    </p>
                  </div>
                </Label>

                <Label
                  htmlFor="openai-onboard"
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer ${
                    data.aiProvider === "openai" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="openai" id="openai-onboard" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu className="h-4 w-4" />
                      <span className="font-medium">OpenAI API</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Uses OpenAI GPT models. Requires an API key.
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {data.aiProvider === "openai" && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">OpenAI API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-..."
                    value={data.openaiApiKey}
                    onChange={(e) => setData({ ...data, openaiApiKey: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={data.openaiModel}
                    onValueChange={(value) => setData({ ...data, openaiModel: value as OpenAIModel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        );

      case "complete":
        return (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">You&apos;re All Set!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your Startup Strategy Council is ready. You can always update your settings and data later.
              </p>
            </div>
            <div className="p-4 bg-secondary rounded-lg text-left max-w-sm mx-auto">
              <p className="font-medium mb-2">{data.companyName || "Your Company"}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Team Size: {data.teamSize}</p>
                <p>Monthly Revenue: EUR {data.monthlyRevenue.toLocaleString()}</p>
                <p>Business Arms: {data.arms.filter((a) => a.name).length}</p>
                <p>AI Provider: {data.aiProvider === "openai" ? "OpenAI" : "Claude CLI"}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      i === currentStep
                        ? "bg-primary text-primary-foreground"
                        : i < currentStep
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < currentStep ? (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                );
              })}
            </div>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip
            </Button>
          </div>
          <Progress value={progress} className="h-1 mt-4" />
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[60vh]">{renderStep()}</CardContent>

        <div className="p-6 pt-0 flex justify-between">
          {currentStep > 0 && currentStep < STEPS.length - 1 ? (
            <Button variant="outline" onClick={handlePrev}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleComplete} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Go to Dashboard"
              )}
            </Button>
          ) : currentStep > 0 ? (
            <Button onClick={handleNext}>
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
