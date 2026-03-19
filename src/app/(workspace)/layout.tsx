import { PawSpaceProvider } from "@/shared/contexts/PawSpaceContext";
import { LibraryProvider } from "@/shared/contexts/LibraryContext";
import { JournalProvider } from "@/shared/contexts/JournalContext";
import { OverviewProvider } from "@/shared/contexts/OverviewContext";
import { ConfirmDialogProvider } from "@/shared/contexts/ConfirmDialogContext";
import ClientLayout from "@/app/ClientLayout";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <PawSpaceProvider>
      <LibraryProvider>
        <JournalProvider>
          <OverviewProvider>
            <ConfirmDialogProvider>
              <ClientLayout>{children}</ClientLayout>
            </ConfirmDialogProvider>
          </OverviewProvider>
        </JournalProvider>
      </LibraryProvider>
    </PawSpaceProvider>
  );
}
