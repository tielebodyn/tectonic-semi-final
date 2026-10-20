import { SeniorHeader } from "@/components/shell/senior-header";

export default function MariaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <SeniorHeader label="My Mantel" />
      <main className="flex-1 px-5 pb-10 pt-2 text-xl leading-relaxed">{children}</main>
    </div>
  );
}
