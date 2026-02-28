'use server';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export async function addSkill(data: any) {
  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Não autorizado' };

  try {
    const { label, name, ...rest } = data;
    const newSkill = await prisma.skill.create({
      data: {
        ...rest,
        userId: userId, 
        name: name || label || 'Novo Protocolo',
        isUnlocked: false,
      },
    });
    return { success: true, skill: newSkill };
  } catch (error) {
    console.error('❌ [Nexus Mutation] Erro ao criar skill:', error);
    return { success: false };
  }
}

export async function updateSkill(skillId: string, data: any) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };

  try {
    const { id, userId: oldUserId, parentId, label, name, ...updateData } = data;
    const updated = await prisma.skill.update({
      where: { 
        id: skillId,
        userId: userId
      },
      data: { ...updateData, name: name || label },
    });
    return { success: true, skill: updated };
  } catch (error) {
    console.error(`❌ [Nexus Mutation] Erro ao atualizar skill ${skillId}:`, error);
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

    const ids = validNodes.map(n => `'${n.id}'`).join(',');

    const nameCases = validNodes.map(n =>
      `WHEN id = '${n.id}' THEN '${(n.data.label || n.data.name || '').replace(/'/g, "''")}'`
    ).join(' ');

    const xCases = validNodes.map(n => `WHEN id = '${n.id}' THEN ${Math.round(n.position.x)}`).join(' ');
    const yCases = validNodes.map(n => `WHEN id = '${n.id}' THEN ${Math.round(n.position.y)}`).join(' ');
    
    const colorCases = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.color || '').replace(/'/g, "''")}'`).join(' ');
    const categoryCases = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.category || '').replace(/'/g, "''")}'`).join(' ');
    const descCases = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.description || '').replace(/'/g, "''")}'`).join(' ');
    const iconCases = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.icon || '').replace(/'/g, "''")}'`).join(' ');
    const shapeCases = validNodes.map(n => `WHEN id = '${n.id}' THEN '${(n.data.shape || 'hexagon').replace(/'/g, "''")}'`).join(' ');

    await prisma.$executeRawUnsafe(`
      UPDATE "Skill"
      SET
        "name"        = CASE ${nameCases}     ELSE "name"      END,
        "positionX"   = CASE ${xCases}        ELSE "positionX" END,
        "positionY"   = CASE ${yCases}        ELSE "positionY" END,
        "color"       = CASE ${colorCases}    ELSE "color"     END,
        "category"    = CASE ${categoryCases} ELSE "category"  END,
        "description" = CASE ${descCases}     ELSE "description" END,
        "icon"        = CASE ${iconCases}     ELSE "icon"      END,
        "shape"       = CASE ${shapeCases}    ELSE "shape"     END
      WHERE id IN (${ids}) AND "userId" = '${userId}'
    `);

    console.log(`✅ [Nexus Mutation] Sincronização Global: ${Date.now() - start}ms`);
    return { success: true };
  } catch (error) {
    console.error('❌ [Nexus Mutation] Erro no salvamento global:', error);
    return { success: false };
  }
}

export async function updateManySkillPositions(
  positions: { skillId: string; x: number; y: number }[]
) {
  const userId = await getAuthUser();
  if (!userId || !positions.length) return { success: false };

  try {
    const ids = positions.map(p => `'${p.skillId}'`).join(',');
    const casesX = positions.map(p => `WHEN id = '${p.skillId}' THEN ${Math.round(p.x)}`).join(' ');
    const casesY = positions.map(p => `WHEN id = '${p.skillId}' THEN ${Math.round(p.y)}`).join(' ');

    await prisma.$executeRawUnsafe(`
      UPDATE "Skill"
      SET "positionX" = CASE ${casesX} END, "positionY" = CASE ${casesY} END
      WHERE id IN (${ids}) AND "userId" = '${userId}'
    `);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function toggleSkillStatus(skillId: string, isUnlocked: boolean) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };

  try {
    await prisma.skill.update({ 
      where: { id: skillId, userId: userId }, 
      data: { isUnlocked } 
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteSkill(skillId: string) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };

  try {
    await prisma.skill.delete({ 
      where: { id: skillId, userId: userId } 
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}