import { PhoneShell } from "@/components/shell/phone-shell";

export default function PhoneLayout({ children }: { children: React.ReactNode }) {
  return <PhoneShell>{children}</PhoneShell>;
}
