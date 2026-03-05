import { Suspense } from 'react';
import LibraryContentPage from "@/components/library/LibraryPage";

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-[#06090f]">
        <div className="w-6 h-6 border-2 border-[#2dd4bf]/20 border-t-[#2dd4bf] rounded-full animate-spin" />
      </div>
    }>
      <LibraryContentPage />
    </Suspense>
  );
}
