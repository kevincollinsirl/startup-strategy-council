import ContextForm from "@/components/ContextForm";
import { getContext } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ContextPage() {
  const context = await getContext();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Company Context</h1>
        <p className="text-muted-foreground">
          This information helps the Startup Strategy Council make better decisions.
          Keep it updated as your situation changes.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ContextForm initialContext={context} />
        </CardContent>
      </Card>
    </div>
  );
}
