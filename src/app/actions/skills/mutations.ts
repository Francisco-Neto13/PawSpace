'use server';

import type { Node } from '@xyflow/react';
import { Prisma } from '@prisma/client';
import type { SkillData } from '@/components/tree/types';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/shared/server/auth';
import { LIMITS } from '@/lib/limits';

const MAX_SKILLS = LIMITS.quantity.skillsPerUser;
const NAME_MAX = LIMITS.skill.name;
const DESC_MAX = LIMITS.skill.description;

export interface SkillMutationInput {
  name?: string;
  label?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  category?: string;
  shape?: string;
  parentId?: string | null;
  positionX?: number;
  positionY?: number;
}

export type PawSpaceSkillNodeInput = Node<SkillData>;

function hasOwn<T extends object>(obj: T, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

async function resolveParentIdForUser(
  parentIdInput: string | null | undefined,
  userId: string,
  skillId?: string
): Promise<{ parentId: string | null; error?: string }> {
  if (parentIdInput === undefined || parentIdInput === null) return { parentId: null };

  const parentId = parentIdInput.trim();
  if (!parentId) return { parentId: null };

  if (skillId && parentId === skillId) {
    return { parentId: null, error: 'Um módulo não pode ser pai de si mesmo.' };
  }

  const parent = await prisma.skill.findFirst({
    where: { id: parentId, userId },
    select: { id: true },
  });

  if (!parent) {
    return { parentId: null, error: 'Módulo pai inválido para este usuário.' };
  }

  return { parentId: parent.id };
}

export async function addSkill(data: SkillMutationInput) {
  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Não autorizado' };

  const name = (data.name || data.label || '').trim();
  const description = (data.description || '').trim();

  if (name.length > NAME_MAX) {
    return { success: false, error: `Nome pode ter no máximo ${NAME_MAX} caracteres.` };
  }
  if (description.length > DESC_MAX) {
    return { success: false, error: `Descrição pode ter no máximo ${DESC_MAX} caracteres.` };
  }

  const count = await prisma.skill.count({ where: { userId } });
  if (count >= MAX_SKILLS) {
    return { success: false, error: `Limite de ${MAX_SKILLS} nos atingido.` };
  }

  try {
    const parentResolution = await resolveParentIdForUser(data.parentId ?? null, userId);
    if (parentResolution.error) {
      return { success: false, error: parentResolution.error };
    }

    const newSkill = await prisma.skill.create({
      data: {
        userId,
        name,
        description: description || null,
        icon: data.icon || null,
        color: data.color || null,
        category: data.category || 'keystone',
        shape: data.shape || 'circle',
        parentId: parentResolution.parentId,
        positionX: Number.isFinite(data.positionX) ? Number(data.positionX) : 0,
        positionY: Number.isFinite(data.positionY) ? Number(data.positionY) : 0,
      },
    });
    return { success: true, skill: newSkill };
  } catch (error) {
    console.error('[Pawspace Mutation] Erro ao criar skill:', error);
    return { success: false };
  }
}

export async function updateSkill(skillId: string, data: SkillMutationInput) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };

  const hasName = hasOwn(data, 'name') || hasOwn(data, 'label');
  const name = (data.name || data.label || '').trim();
  const hasDescription = hasOwn(data, 'description');
  const description = (data.description || '').trim();

  if (hasName && name.length > NAME_MAX) {
    return { success: false, error: `Nome pode ter no máximo ${NAME_MAX} caracteres.` };
  }
  if (hasDescription && description.length > DESC_MAX) {
    return { success: false, error: `Descrição pode ter no máximo ${DESC_MAX} caracteres.` };
  }

  try {
    const updateData: SkillMutationInput = {
      ...(hasName ? { name } : {}),
      ...(hasDescription ? { description: description || null } : {}),
      ...(hasOwn(data, 'icon') ? { icon: data.icon || null } : {}),
      ...(hasOwn(data, 'color') ? { color: data.color || null } : {}),
      ...(hasOwn(data, 'category') && data.category ? { category: data.category } : {}),
      ...(hasOwn(data, 'shape') && data.shape ? { shape: data.shape } : {}),
      ...(hasOwn(data, 'positionX') && data.positionX !== undefined ? { positionX: data.positionX } : {}),
      ...(hasOwn(data, 'positionY') && data.positionY !== undefined ? { positionY: data.positionY } : {}),
    };

    if (hasOwn(data, 'parentId')) {
      const parentResolution = await resolveParentIdForUser(data.parentId ?? null, userId, skillId);
      if (parentResolution.error) {
        return { success: false, error: parentResolution.error };
      }
      updateData.parentId = parentResolution.parentId;
    }

    const updated = await prisma.skill.update({
      where: { id: skillId, userId },
      data: updateData,
    });
    return { success: true, skill: updated };
  } catch (error) {
    console.error(`[Pawspace Mutation] Erro ao atualizar skill ${skillId}:`, error);
    return { success: false };
  }
}

export async function savePawSpaceChanges(nodes: PawSpaceSkillNodeInput[]) {
  const userId = await getAuthUser();
  if (!userId || !nodes.length) return { success: false };

  const start = Date.now();
  try {
    const validNodes = nodes.filter((n) => n.id && !n.id.startsWith('dndnode'));
    if (!validNodes.length) return { success: true };

    const payload = validNodes.map((node) => {
      const label = (node.data.label || node.data.name || '').slice(0, NAME_MAX).trim();
      const description = (node.data.description || '').slice(0, DESC_MAX).trim();
      const color = (node.data.color || '').trim();
      const icon = (node.data.icon || '').trim();
      const category = (node.data.category || '').trim() || 'keystone';
      const shape = (node.data.shape || 'circle').trim() || 'circle';

      return {
        id: node.id,
        name: label,
        positionX: Number.isFinite(node.position.x) ? Math.round(node.position.x) : 0,
        positionY: Number.isFinite(node.position.y) ? Math.round(node.position.y) : 0,
        color: color || null,
        category,
        description: description || null,
        icon: icon || null,
        shape,
      };
    });

    const rows = payload.map((item) =>
      Prisma.sql`(${item.id}, ${item.name}, ${item.positionX}, ${item.positionY}, ${item.color}, ${item.category}, ${item.description}, ${item.icon}, ${item.shape})`
    );

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "Skill" AS s
        SET
          "name" = v."name",
          "positionX" = v."positionX",
          "positionY" = v."positionY",
          "color" = v."color",
          "category" = v."category",
          "description" = v."description",
          "icon" = v."icon",
          "shape" = v."shape"
        FROM (
          VALUES ${Prisma.join(rows)}
        ) AS v("id", "name", "positionX", "positionY", "color", "category", "description", "icon", "shape")
        WHERE s."id" = v."id" AND s."userId" = ${userId}
      `
    );

    console.log(`[Pawspace Mutation] Sincronização: ${Date.now() - start}ms`);
    return { success: true };
  } catch (error) {
    console.error('[Pawspace Mutation] Erro no salvamento global:', error);
    return { success: false };
  }
}

export async function updateManySkillPositions(positions: { skillId: string; x: number; y: number }[]) {
  const userId = await getAuthUser();
  if (!userId || !positions.length) return { success: false };
  try {
    const validPositions = positions
      .filter((p) => typeof p.skillId === 'string' && p.skillId.trim().length > 0)
      .map((p) => ({
        skillId: p.skillId.trim(),
        x: Number.isFinite(p.x) ? Math.round(p.x) : 0,
        y: Number.isFinite(p.y) ? Math.round(p.y) : 0,
      }));

    if (!validPositions.length) return { success: false };

    const rows = validPositions.map((p) => Prisma.sql`(${p.skillId}, ${p.x}, ${p.y})`);

    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE "Skill" AS s
        SET
          "positionX" = v."positionX",
          "positionY" = v."positionY"
        FROM (
          VALUES ${Prisma.join(rows)}
        ) AS v("id", "positionX", "positionY")
        WHERE s."id" = v."id" AND s."userId" = ${userId}
      `
    );

    return { success: true };
  } catch (error) {
    console.error('[Pawspace Mutation] Erro ao atualizar posições:', error);
    return { success: false };
  }
}

export async function deleteSkill(skillId: string) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };
  try {
    await prisma.skill.delete({ where: { id: skillId, userId } });
    return { success: true };
  } catch {
    return { success: false };
  }
}
