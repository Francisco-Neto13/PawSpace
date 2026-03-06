'use server';

import prisma from '@/lib/prisma';
import { getAuthUser } from './auth-helper';
import { LIMITS } from '@/lib/limits';

const MAX_SKILLS = LIMITS.quantity.skillsPerUser;
const NAME_MAX   = LIMITS.skill.name;
const DESC_MAX   = LIMITS.skill.description;

export async function addSkill(data: any) {
  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Não autorizado' };

  const name        = (data.name || data.label || '').trim();
  const description = (data.description || '').trim();

  if (name.length > NAME_MAX)
    return { success: false, error: `Nome pode ter no máximo ${NAME_MAX} caracteres.` };
  if (description.length > DESC_MAX)
    return { success: false, error: `Descrição pode ter no máximo ${DESC_MAX} caracteres.` };

  const count = await prisma.skill.count({ where: { userId } });
  if (count >= MAX_SKILLS)
    return { success: false, error: `Limite de ${MAX_SKILLS} nós atingido.` };

  try {
    const { label, name: _name, ...rest } = data;
    const newSkill = await prisma.skill.create({
      data: { ...rest, userId, name },
    });
    return { success: true, skill: newSkill };
  } catch (error) {
    console.error('❌ [Pawspace Mutation] Erro ao criar skill:', error);
    return { success: false };
  }
}

export async function updateSkill(skillId: string, data: any) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };

  const name        = (data.name || data.label || '').trim();
  const description = (data.description || '').trim();

  if (name && name.length > NAME_MAX)
    return { success: false, error: `Nome pode ter no máximo ${NAME_MAX} caracteres.` };
  if (description && description.length > DESC_MAX)
    return { success: false, error: `Descrição pode ter no máximo ${DESC_MAX} caracteres.` };

  try {
    const { id, userId: oldUserId, parentId, label, name: _name, ...updateData } = data;
    const updated = await prisma.skill.update({
      where: { id: skillId, userId },
      data: { ...updateData, name: name || undefined },
    });
    return { success: true, skill: updated };
  } catch (error) {
    console.error(`❌ [Pawspace Mutation] Erro ao atualizar skill ${skillId}:`, error);
    return { success: false };
  }
}

export async function saveNexusChanges(nodes: any[]) {
  const userId = await getAuthUser();
  if (!userId || !nodes.length) return { success: false };

  const start = Date.now();
  try {
    const validNodes = nodes.filter(n => n.id && !n.id.startsWith('dndnode'));
    if (!validNodes.length) return { success: true };

    const ids           = validNodes.map(n => `'${n.id}'`).join(',');
    const nameCases     = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.label || n.data.name || '').slice(0, NAME_MAX).replace(/'/g, "''")}'`).join(' ');
    const xCases        = validNodes.map(n => `WHEN id = '${n.id}' THEN ${Math.round(n.position.x)}`).join(' ');
    const yCases        = validNodes.map(n => `WHEN id = '${n.id}' THEN ${Math.round(n.position.y)}`).join(' ');
    const colorCases    = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.color || '').replace(/'/g, "''")}'`).join(' ');
    const categoryCases = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.category || '').replace(/'/g, "''")}'`).join(' ');
    const descCases     = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.description || '').slice(0, DESC_MAX).replace(/'/g, "''")}'`).join(' ');
    const iconCases     = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.icon || '').replace(/'/g, "''")}'`).join(' ');
    const shapeCases    = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.shape || 'hexagon').replace(/'/g, "''")}'`).join(' ');

    await prisma.$executeRawUnsafe(`
      UPDATE "Skill"
      SET
        "name"        = CASE ${nameCases}     ELSE "name"        END,
        "positionX"   = CASE ${xCases}        ELSE "positionX"   END,
        "positionY"   = CASE ${yCases}        ELSE "positionY"   END,
        "color"       = CASE ${colorCases}    ELSE "color"       END,
        "category"    = CASE ${categoryCases} ELSE "category"    END,
        "description" = CASE ${descCases}     ELSE "description" END,
        "icon"        = CASE ${iconCases}     ELSE "icon"        END,
        "shape"       = CASE ${shapeCases}    ELSE "shape"       END
      WHERE id IN (${ids}) AND "userId" = '${userId}'
    `);

    console.log(`✅ [Pawspace Mutation] Sincronização: ${Date.now() - start}ms`);
    return { success: true };
  } catch (error) {
    console.error('❌ [Pawspace Mutation] Erro no salvamento global:', error);
    return { success: false };
  }
}

export async function updateManySkillPositions(positions: { skillId: string; x: number; y: number }[]) {
  const userId = await getAuthUser();
  if (!userId || !positions.length) return { success: false };
  try {
    const ids    = positions.map(p => `'${p.skillId}'`).join(',');
    const casesX = positions.map(p => `WHEN id = '${p.skillId}' THEN ${Math.round(p.x)}`).join(' ');
    const casesY = positions.map(p => `WHEN id = '${p.skillId}' THEN ${Math.round(p.y)}`).join(' ');
    await prisma.$executeRawUnsafe(`
      UPDATE "Skill"
      SET "positionX" = CASE ${casesX} END, "positionY" = CASE ${casesY} END
      WHERE id IN (${ids}) AND "userId" = '${userId}'
    `);
    return { success: true };
  } catch { return { success: false }; }
}

export async function deleteSkill(skillId: string) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };
  try {
    await prisma.skill.delete({ where: { id: skillId, userId } });
    return { success: true };
  } catch { return { success: false }; }
}
