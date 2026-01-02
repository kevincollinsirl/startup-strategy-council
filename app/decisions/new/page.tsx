import DecisionForm from "@/components/DecisionForm";

export default function NewDecisionPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">New Decision</h1>
        <p className="text-gray-400">
          Describe the decision and the options you&apos;re considering.
          The Strategy Council will evaluate each option from multiple perspectives.
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6">
        <DecisionForm />
      </div>
    </div>
  );
}
