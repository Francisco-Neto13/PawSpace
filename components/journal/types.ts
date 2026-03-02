export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  skillId: string | null;
  userId: string;
  createdAt: Date | string;
  updatedAt?: Date | string;

  skill?: {
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

export interface SkillBase {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isUnlocked: boolean;
}

export function getSkill(skillId: string | null, skills: any[]) {
  if (!skillId) return null;
  return skills.find(s => s.id === skillId) ?? null;
}

export function formatDate(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).replace('.', ''); 
}

export function getEntrySummary(htmlBody: string, length = 100) {
  const plainText = htmlBody.replace(/<[^>]*>?/gm, '');
  return plainText.length > length 
    ? plainText.substring(0, length) + '...' 
    : plainText;
}