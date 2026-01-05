"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Users,
  Brain,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export default function InstructionsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Instructions</h1>
        <p className="text-muted-foreground">
          Learn how to use Startup Strategy Council to make better strategic decisions
        </p>
      </div>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
          <TabsTrigger value="agents">Agent Guide</TabsTrigger>
          <TabsTrigger value="tips">Tips & Best Practices</TabsTrigger>
        </TabsList>

        {/* Getting Started */}
        <TabsContent value="getting-started" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Welcome to Startup Strategy Council
              </CardTitle>
              <CardDescription>
                A multi-agent AI system for strategic business decision-making
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                Startup Strategy Council uses multiple AI agents, each with a specialized perspective,
                to analyze your strategic decisions. The agents debate, challenge each other,
                and synthesize their insights into a recommendation with confidence levels.
              </p>

              <div className="space-y-4">
                <h3 className="font-semibold">Quick Start Steps</h3>
                <div className="space-y-3">
                  {[
                    {
                      step: 1,
                      title: "Set Up Your Company Context",
                      description: "Go to Company Context to enter your company details, financials, and strategic goals.",
                    },
                    {
                      step: 2,
                      title: "Configure Business Arms",
                      description: "Add your business verticals/revenue streams in Business Arms to help agents understand your portfolio.",
                    },
                    {
                      step: 3,
                      title: "Add Market Intelligence",
                      description: "Enter your TAM/SAM/SOM and competitors in Market Intel for competitive analysis.",
                    },
                    {
                      step: 4,
                      title: "Create Your First Decision",
                      description: "Click 'New Decision' to describe a strategic choice and the options you're considering.",
                    },
                    {
                      step: 5,
                      title: "Review Council Recommendations",
                      description: "The AI council will analyze your decision and provide a synthesized recommendation.",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-3 p-3 bg-secondary rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* How It Works */}
        <TabsContent value="how-it-works" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                The Multi-Agent Council Approach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">How Decisions Are Analyzed</h3>
                <div className="space-y-3">
                  {[
                    {
                      phase: "Phase 1: Initial Analysis",
                      description: "Each specialist agent independently evaluates all options from their perspective (financial, risk, market, etc.).",
                    },
                    {
                      phase: "Phase 2: Deliberation",
                      description: "Agents with significantly different scores debate their positions. The Chief of Staff facilitates and resolves disagreements.",
                    },
                    {
                      phase: "Phase 3: Synthesis",
                      description: "All perspectives are synthesized into a final recommendation with confidence levels and noted dissent.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-secondary rounded-lg">
                      <ChevronRight className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{item.phase}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Understanding Confidence Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="font-medium">70-100%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Strong consensus among agents. High confidence in recommendation.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="font-medium">50-70%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      General agreement with some concerns. Proceed with awareness of risks.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      <span className="font-medium">Below 50%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Significant disagreement. Consider gathering more information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Guide */}
        <TabsContent value="agents" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              {
                name: "Financial Analyst",
                icon: TrendingUp,
                focus: "ROI, cash flow, payback periods, expected value",
                description: "Evaluates the financial implications of each option. Considers payoff matrices, break-even analysis, and how decisions affect your overall financial position.",
              },
              {
                name: "Market Analyst",
                icon: Target,
                focus: "TAM/SAM/SOM, competitive positioning, timing",
                description: "Analyzes market opportunity and competitive dynamics. Uses your market data to assess positioning, timing, and potential customer segment fit.",
              },
              {
                name: "Risk Agent",
                icon: Shield,
                focus: "Execution, market, technical, financial risks",
                description: "Identifies and quantifies risks across multiple dimensions. Considers reversibility, downside scenarios, and potential mitigations.",
              },
              {
                name: "Game Theory Agent",
                icon: Zap,
                focus: "Nash equilibrium, first-mover advantage, network effects",
                description: "Applies game theory to analyze competitive dynamics. Considers how competitors might respond and long-term strategic positioning.",
              },
              {
                name: "Resource Allocation",
                icon: Clock,
                focus: "Time investment, bottlenecks, delegation opportunities",
                description: "Evaluates resource requirements with founder time as the scarcest resource. Identifies bottlenecks and scaling implications.",
              },
              {
                name: "Chief of Staff",
                icon: Users,
                focus: "Synthesis, consensus building, final recommendation",
                description: "Facilitates debate between agents, resolves disagreements, and synthesizes all perspectives into a coherent recommendation.",
              },
            ].map((agent) => (
              <Card key={agent.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <agent.icon className="h-5 w-5" />
                    {agent.name}
                  </CardTitle>
                  <CardDescription>{agent.focus}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tips & Best Practices */}
        <TabsContent value="tips" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Tips for Better Decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Writing Good Decision Descriptions</h3>
                <ul className="space-y-2">
                  {[
                    "Be specific about the context and constraints",
                    "Explain why this decision matters now",
                    "Include relevant background information",
                    "Mention any deadlines or time pressure",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Defining Clear Options</h3>
                <ul className="space-y-2">
                  {[
                    "Options should be mutually exclusive",
                    "Include a 'do nothing' option when relevant",
                    "Be realistic with cost and time estimates",
                    "Describe what success looks like for each option",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Getting the Most Value</h3>
                <ul className="space-y-2">
                  {[
                    "Keep your company context up to date",
                    "Add competitors as you learn about them",
                    "Track decision outcomes to improve future analysis",
                    "Pay attention to dissenting opinions - they often highlight real risks",
                    "Use low-confidence scores as a signal to gather more information",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
