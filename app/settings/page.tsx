"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Check, AlertCircle, Cpu, Terminal } from "lucide-react";
import { AIProvider, OpenAIModel } from "@/lib/types";

interface SettingsData {
  aiProvider: AIProvider;
  openaiApiKey: string;
  openaiModel: OpenAIModel;
  hasOpenAIKey: boolean;
  onboardingCompleted: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [newApiKey, setNewApiKey] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiProvider: settings.aiProvider,
          openaiModel: settings.openaiModel,
          openaiApiKey: newApiKey || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setNewApiKey("");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
    setSaving(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: newApiKey || undefined,
        }),
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ success: false, error: "Connection test failed" });
    }
    setTesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your AI provider and application preferences
        </p>
      </div>

      {/* AI Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>AI Provider</CardTitle>
          <CardDescription>
            Choose which AI provider to use for decision analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={settings.aiProvider}
            onValueChange={(value) =>
              setSettings({ ...settings, aiProvider: value as AIProvider })
            }
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Label
              htmlFor="claude-cli"
              className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                settings.aiProvider === "claude-cli"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <RadioGroupItem value="claude-cli" id="claude-cli" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="h-4 w-4" />
                  <span className="font-medium">Claude CLI</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Uses Claude Code CLI. Requires Claude CLI to be installed and authenticated.
                </p>
              </div>
            </Label>

            <Label
              htmlFor="openai"
              className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                settings.aiProvider === "openai"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <RadioGroupItem value="openai" id="openai" className="mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Cpu className="h-4 w-4" />
                  <span className="font-medium">OpenAI API</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Uses OpenAI GPT models. Requires an OpenAI API key.
                </p>
              </div>
            </Label>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* OpenAI Configuration */}
      {settings.aiProvider === "openai" && (
        <Card>
          <CardHeader>
            <CardTitle>OpenAI Configuration</CardTitle>
            <CardDescription>
              Configure your OpenAI API settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={settings.hasOpenAIKey ? "Enter new key to replace existing" : "sk-..."}
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                />
                <Button
                  variant="secondary"
                  onClick={handleTestConnection}
                  disabled={testing || (!newApiKey && !settings.hasOpenAIKey)}
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Test"
                  )}
                </Button>
              </div>
              {settings.hasOpenAIKey && !newApiKey && (
                <p className="text-sm text-muted-foreground">
                  Current key: {settings.openaiApiKey}
                </p>
              )}
              {testResult && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    testResult.success ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {testResult.success ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Connection successful
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      {testResult.error}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={settings.openaiModel}
                onValueChange={(value) =>
                  setSettings({ ...settings, openaiModel: value as OpenAIModel })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, Lower Cost)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                GPT-4o offers the best balance of speed and capability for strategic analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
        {saved && (
          <span className="text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Settings saved
          </span>
        )}
      </div>
    </div>
  );
}
