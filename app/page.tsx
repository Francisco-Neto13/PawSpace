'use client';
import dynamic from 'next/dynamic';

const SkillTree = dynamic(
  () => import('@/components/tree/SkillTree').then(m => m.SkillTree),
  { ssr: false }
);

export default function Home() {
  return <SkillTree />;
}