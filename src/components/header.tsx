import { Building2 } from "lucide-react";

export function Header() {
  return (
    <header className="bg-card border-b p-4 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-primary">
          Deal Dive
        </h1>
      </div>
    </header>
  );
}
