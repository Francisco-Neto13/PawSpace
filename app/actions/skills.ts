'use server';

import * as mutations from './skills/mutations';
import * as queries from './skills/queries';

export async function addSkill(data: any) { return mutations.addSkill(data); }
export async function updateSkill(id: string, data: any) { return mutations.updateSkill(id, data); }
export async function updateManySkillPositions(pos: any[]) { return mutations.updateManySkillPositions(pos); }
export async function saveNexusChanges(nodes: any[]) { return mutations.saveNexusChanges(nodes); }
export async function deleteSkill(id: string) { return mutations.deleteSkill(id); }

export async function getSkillsFull() { return queries.getSkillsFull(); }
export async function getSkillsSummary() { return queries.getSkillsSummary(); }
