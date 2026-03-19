import ClientLayout from "@/app/ClientLayout";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
