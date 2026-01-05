import DecisionForm from "@/components/DecisionForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewDecisionPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">New Decision</h1>
        <p className="text-muted-foreground">
          Describe the decision and the options you&apos;re considering.
          The Startup Strategy Council will evaluate each option from multiple perspectives.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DecisionForm />
        </CardContent>
      </Card>
    </div>
  );
}
