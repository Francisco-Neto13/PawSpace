'use server';

import type { Node } from '@xyflow/react';
import { Prisma } from '@prisma/client';

import type { SkillData } from '@/components/tree/types';
import { LIMITS } from '@/lib/limits';
import prisma from '@/lib/prisma';
import { enforceUserActionRateLimit, validateIdentifier } from '@/shared/server/actionSecurity';
import { getAuthUser } from '@/shared/server/auth';

const MAX_SKILLS = LIMITS.quantity.skillsPerUser;
const NAME_MAX = LIMITS.skill.name;
const DESC_MAX = LIMITS.skill.description;
const SKILL_ID_MAX = 128;
const VALID_SKILL_SHAPES = new Set(['circle']);
const VALID_CATEGORY_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;
const SKILL_MUTATION_RATE_LIMIT = 40;
const SKILL_MUTATION_WINDOW_MS = 5 * 60 * 1000;

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

function toClientSkill(skill: {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  category: string;
  shape: string;
  parentId: string | null;
  positionX: number;
  positionY: number;
}) {
  return {
    id: skill.id,
    name: skill.name,
    description: skill.description,
    icon: skill.icon,
    color: skill.color,
    category: skill.category,
    shape: skill.shape,
    parentId: skill.parentId,
    positionX: skill.positionX,
    positionY: skill.positionY,
  };
}

function hasOwn<T extends object>(obj: T, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function normalizeSkillCategory(value: string | null | undefined) {
  const category = (value || '').trim();
  return VALID_CATEGORY_PATTERN.test(category) ? category : 'keystone';
}

function normalizeSkillShape(value: string | null | undefined) {
  const shape = (value || '').trim();
  return VALID_SKILL_SHAPES.has(shape) ? shape : 'circle';
}

function createSkillRateLimitError(message: string) {
  return { success: false as const, error: message };
}

async function resolveParentIdForUser(
  parentIdInput: string | null | undefined,
  userId: string,
  skillId?: string
): Promise<{ parentId: string | null; error?: string }> {
  if (parentIdInput === undefined || parentIdInput === null) return { parentId: null };

  const validated = validateIdentifier(parentIdInput, { allowEmpty: true, maxLength: SKILL_ID_MAX });
  if (!validated.ok) {
    return { parentId: null, error: 'Modulo pai invalido para este usuario.' };
  }

  if (!validated.value) return { parentId: null };

  if (skillId && validated.value === skillId) {
    return { parentId: null, error: 'Um modulo nao pode ser pai de si mesmo.' };
  }

  const parent = await prisma.skill.findFirst({
    where: { id: validated.value, userId },
    select: { id: true },
  });

  if (!parent) {
    return { parentId: null, error: 'Modulo pai invalido para este usuario.' };
  }

  return { parentId: parent.id };
}

function enforceSkillRateLimit(scope: string, userId: string, message: string) {
  const result = enforceUserActionRateLimit({
    scope,
    userId,
    limit: SKILL_MUTATION_RATE_LIMIT,
    windowMs: SKILL_MUTATION_WINDOW_MS,
  });

  return result.allowed ? null : createSkillRateLimitError(message);
}

export async function addSkill(data: SkillMutationInput) {
  const userId = await getAuthUser();
  if (!userId) return { success: false, error: 'Nao autorizado' };

  const rateLimitError = enforceSkillRateLimit(
    'skill-add',
    userId,
    'Muitas alteracoes na arvore. Tente novamente em instantes.'
  );
  if (rateLimitError) return rateLimitError;

  const name = (data.name || data.label || '').trim();
  const description = (data.description || '').trim();

  if (!name) {
    return { success: false, error: 'Nome obrigatorio.' };
  }
  if (name.length > NAME_MAX) {
    return { success: false, error: `Nome pode ter no maximo ${NAME_MAX} caracteres.` };
  }
  if (description.length > DESC_MAX) {
    return { success: false, error: `Descricao pode ter no maximo ${DESC_MAX} caracteres.` };
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
        category: normalizeSkillCategory(data.category),
        shape: normalizeSkillShape(data.shape),
        parentId: parentResolution.parentId,
        positionX: Number.isFinite(data.positionX) ? Number(data.positionX) : 0,
        positionY: Number.isFinite(data.positionY) ? Number(data.positionY) : 0,
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        category: true,
        shape: true,
        parentId: true,
        positionX: true,
        positionY: true,
      },
    });

    return { success: true, skill: toClientSkill(newSkill) };
  } catch (error) {
    console.error('[Pawspace Mutation] Erro ao criar skill:', error);
    return { success: false };
  }
}

export async function updateSkill(skillId: string, data: SkillMutationInput) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };

  const rateLimitError = enforceSkillRateLimit(
    'skill-update',
    userId,
    'Muitas alteracoes na arvore. Tente novamente em instantes.'
  );
  if (rateLimitError) return rateLimitError;

  const validatedSkillId = validateIdentifier(skillId, { maxLength: SKILL_ID_MAX });
  if (!validatedSkillId.ok || !validatedSkillId.value) {
    return { success: false, error: 'Modulo invalido.' };
  }

  const hasName = hasOwn(data, 'name') || hasOwn(data, 'label');
  const name = (data.name || data.label || '').trim();
  const hasDescription = hasOwn(data, 'description');
  const description = (data.description || '').trim();

  if (hasName && !name) {
    return { success: false, error: 'Nome obrigatorio.' };
  }
  if (hasName && name.length > NAME_MAX) {
    return { success: false, error: `Nome pode ter no maximo ${NAME_MAX} caracteres.` };
  }
  if (hasDescription && description.length > DESC_MAX) {
    return { success: false, error: `Descricao pode ter no maximo ${DESC_MAX} caracteres.` };
  }

  try {
    const updateData: SkillMutationInput = {
      ...(hasName ? { name } : {}),
      ...(hasDescription ? { description: description || null } : {}),
      ...(hasOwn(data, 'icon') ? { icon: data.icon || null } : {}),
      ...(hasOwn(data, 'color') ? { color: data.color || null } : {}),
      ...(hasOwn(data, 'category') ? { category: normalizeSkillCategory(data.category) } : {}),
      ...(hasOwn(data, 'shape') ? { shape: normalizeSkillShape(data.shape) } : {}),
      ...(hasOwn(data, 'positionX') && data.positionX !== undefined ? { positionX: data.positionX } : {}),
      ...(hasOwn(data, 'positionY') && data.positionY !== undefined ? { positionY: data.positionY } : {}),
    };

    if (hasOwn(data, 'parentId')) {
      const parentResolution = await resolveParentIdForUser(data.parentId ?? null, userId, validatedSkillId.value);
      if (parentResolution.error) {
        return { success: false, error: parentResolution.error };
      }
      updateData.parentId = parentResolution.parentId;
    }

    const updated = await prisma.skill.update({
      where: { id: validatedSkillId.value, userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
        category: true,
        shape: true,
        parentId: true,
        positionX: true,
        positionY: true,
      },
    });

    return { success: true, skill: toClientSkill(updated) };
  } catch (error) {
    console.error(`[Pawspace Mutation] Erro ao atualizar skill ${skillId}:`, error);
    return { success: false };
  }
}

export async function savePawSpaceChanges(nodes: PawSpaceSkillNodeInput[]) {
  const userId = await getAuthUser();
  if (!userId || !nodes.length) return { success: false };

  const rateLimitError = enforceSkillRateLimit(
    'skill-bulk-save',
    userId,
    'Muitas sincronizacoes da arvore. Tente novamente em instantes.'
  );
  if (rateLimitError) return rateLimitError;
  if (nodes.length > MAX_SKILLS) {
    return { success: false, error: `Limite de ${MAX_SKILLS} nos por sincronizacao excedido.` };
  }

  const start = Date.now();
  try {
    const validNodes = nodes.filter((node) => {
      if (!node.id || node.id.startsWith('dndnode')) return false;
      const validatedId = validateIdentifier(node.id, { maxLength: SKILL_ID_MAX });
      return validatedId.ok && Boolean(validatedId.value);
    });
    if (!validNodes.length) return { success: true };

    const payload = validNodes.map((node) => {
      const label = (node.data.label || node.data.name || '').slice(0, NAME_MAX).trim();
      const description = (node.data.description || '').slice(0, DESC_MAX).trim();
      const color = (node.data.color || '').trim();
      const icon = (node.data.icon || '').trim();

      return {
        id: node.id,
        name: label || 'Modulo',
        positionX: Number.isFinite(node.position.x) ? Math.round(node.position.x) : 0,
        positionY: Number.isFinite(node.position.y) ? Math.round(node.position.y) : 0,
        color: color || null,
        category: normalizeSkillCategory(node.data.category),
        description: description || null,
        icon: icon || null,
        shape: normalizeSkillShape(node.data.shape),
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

    console.log(`[Pawspace Mutation] Sincronizacao: ${Date.now() - start}ms`);
    return { success: true };
  } catch (error) {
    console.error('[Pawspace Mutation] Erro no salvamento global:', error);
    return { success: false };
  }
}

export async function updateManySkillPositions(positions: { skillId: string; x: number; y: number }[]) {
  const userId = await getAuthUser();
  if (!userId || !positions.length) return { success: false };

  const rateLimitError = enforceSkillRateLimit(
    'skill-position-bulk',
    userId,
    'Muitas atualizacoes de posicao. Tente novamente em instantes.'
  );
  if (rateLimitError) return rateLimitError;
  if (positions.length > MAX_SKILLS) {
    return { success: false, error: `Limite de ${MAX_SKILLS} nos por lote excedido.` };
  }

  try {
    const validPositions = positions
      .filter((position) => {
        const validatedId = validateIdentifier(position.skillId, { maxLength: SKILL_ID_MAX });
        return validatedId.ok && Boolean(validatedId.value);
      })
      .map((position) => ({
        skillId: position.skillId.trim(),
        x: Number.isFinite(position.x) ? Math.round(position.x) : 0,
        y: Number.isFinite(position.y) ? Math.round(position.y) : 0,
      }));

    if (!validPositions.length) return { success: false };

    const rows = validPositions.map((position) => Prisma.sql`(${position.skillId}, ${position.x}, ${position.y})`);

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
    console.error('[Pawspace Mutation] Erro ao atualizar posicoes:', error);
    return { success: false };
  }
}

export async function deleteSkill(skillId: string) {
  const userId = await getAuthUser();
  if (!userId) return { success: false };

  const rateLimitError = enforceSkillRateLimit(
    'skill-delete',
    userId,
    'Muitas tentativas de exclusao. Tente novamente em instantes.'
  );
  if (rateLimitError) return rateLimitError;

  const validatedSkillId = validateIdentifier(skillId, { maxLength: SKILL_ID_MAX });
  if (!validatedSkillId.ok || !validatedSkillId.value) {
    return { success: false, error: 'Modulo invalido.' };
  }

  try {
    await prisma.skill.delete({ where: { id: validatedSkillId.value, userId } });
    return { success: true };
  } catch {
    return { success: false };
  }
}
