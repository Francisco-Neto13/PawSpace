'use server';

import * as mutations from './skills/mutations';
import * as queries from './skills/queries';
import type { NexusSkillNodeInput, SkillMutationInput } from './skills/mutations';

export async function addSkill(data: SkillMutationInput) { return mutations.addSkill(data); }
export async function updateSkill(id: string, data: SkillMutationInput) { return mutations.updateSkill(id, data); }
export async function updateManySkillPositions(pos: { skillId: string; x: number; y: number }[]) {
  return mutations.updateManySkillPositions(pos);
}
export async function saveNexusChanges(nodes: NexusSkillNodeInput[]) { return mutations.saveNexusChanges(nodes); }
export async function deleteSkill(id: string) { return mutations.deleteSkill(id); }

export async function getSkillsFull() { return queries.getSkillsFull(); }
export async function getSkillsSummary() { return queries.getSkillsSummary(); }
