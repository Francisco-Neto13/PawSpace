'use server';

import * as mutations from './skills/mutations';
import * as queries from './skills/queries';

export const { 
  addSkill, 
  updateSkill, 
  updateManySkillPositions, 
  saveNexusChanges, 
  toggleSkillStatus, 
  deleteSkill 
} = mutations;

export const { 
  getSkillsFull, 
  getSkillsSummary 
} = queries;