import { Suspense } from 'react';
import BibliotecaPage from "@/components/library/BibliotecaPage";

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-[#030304]">
        <div className="w-6 h-6 border-2 border-[#c8b89a]/20 border-t-[#c8b89a] rounded-full animate-spin" />
      </div>
    }>
      <BibliotecaPage />
    </Suspense>
  );
}