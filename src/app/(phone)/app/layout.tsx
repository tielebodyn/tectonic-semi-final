import { AppHeader, BottomNav } from "@/components/shell/app-chrome";

export default function FamilyAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex-1 px-4 pb-8 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
