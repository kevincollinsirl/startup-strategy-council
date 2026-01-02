import ContextForm from "@/components/ContextForm";
import { getContext } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function ContextPage() {
  const context = await getContext();

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Company Context</h1>
        <p className="text-gray-400">
          This information helps the Strategy Council make better decisions.
          Keep it updated as your situation changes.
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <ContextForm initialContext={context} />
      </div>
    </div>
  );
}
