import { DealAnalyzer } from "@/components/deal-analyzer";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <DealAnalyzer />
      </main>
    </div>
  );
}
