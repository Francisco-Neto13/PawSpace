'use client';
import dynamic from 'next/dynamic';

const SkillTree = dynamic(
  () => import('@/components/tree/SkillTree').then(m => m.SkillTree),
  { 
    ssr: false,
    loading: () => <div className="h-screen w-screen bg-[#030304]" /> 
  }
);

export default function Home() {
  return <SkillTree />;
}