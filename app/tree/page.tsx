'use client';
import dynamic from 'next/dynamic';

const SkillTree = dynamic(
  () => import('@/components/tree/SkillTree').then(m => m.SkillTree),
  { 
    ssr: false, 
    loading: () => <div className="h-full w-full bg-[#030304]" /> 
  }
);

export default function TreePage() {
  return <SkillTree />;
}