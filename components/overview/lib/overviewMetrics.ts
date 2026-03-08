'use client';

import { Edge } from '@xyflow/react';
import { SkillNode } from '@/shared/contexts/NexusContext';

export interface OverviewStats {
  total: number;
  unlocked: number;
  progress: number;
}

export interface CategoryCoverageDatum {
  category: string;
  total: number;
  withContent: number;
  pending: number;
  pct: number;
}

export interface DepthDistributionDatum {
  level: string;
  levelNum: number;
  total: number;
  withContent: number;
  gap: number;
  pct: number;
}

export interface CriticalNodeDatum {
  id: string;
  name: string;
  icon: string;
  color: string;
  hasContent: boolean;
  totalContent: number;
  linksCount: number;
  contentsCount: number;
  dependents: number;
}

export interface OverviewSnapshot {
  stats: OverviewStats;
  categoryData: CategoryCoverageDatum[];
  depthData: DepthDistributionDatum[];
  maxGapLevel: string | null;
  criticalNodes: CriticalNodeDatum[];
}

function getCounts(nodeData: unknown) {
  const data = nodeData as { links?: unknown[]; contents?: unknown[] };
  const linksCount = Array.isArray(data?.links) ? data.links.length : 0;
  const contentsCount = Array.isArray(data?.contents) ? data.contents.length : 0;
  return {
    linksCount,
    contentsCount,
    totalContent: linksCount + contentsCount,
  };
}

function normalizeCategory(value: unknown) {
  if (typeof value !== 'string') return 'outros';
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : 'outros';
}

export function buildOverviewSnapshot(
  nodes: SkillNode[],
  edges: Edge[],
  fallbackStats: OverviewStats
): OverviewSnapshot {
  if (!nodes || nodes.length === 0) {
    return {
      stats: fallbackStats,
      categoryData: [],
      depthData: [],
      maxGapLevel: null,
      criticalNodes: [],
    };
  }

  const childToParent = new Map<string, string>();
  const childCount = new Map<string, number>();
  edges.forEach((e) => {
    childToParent.set(e.target, e.source);
    childCount.set(e.source, (childCount.get(e.source) ?? 0) + 1);
  });

  const depthCache = new Map<string, number>();
  const getDepth = (id: string, stack = new Set<string>()): number => {
    const cached = depthCache.get(id);
    if (cached !== undefined) return cached;
    if (stack.has(id)) return 0;

    const parentId = childToParent.get(id);
    if (!parentId) {
      depthCache.set(id, 0);
      return 0;
    }

    stack.add(id);
    const depth = Math.min(getDepth(parentId, stack) + 1, 50);
    stack.delete(id);
    depthCache.set(id, depth);
    return depth;
  };

  let unlocked = 0;
  const categoryMap = new Map<string, { total: number; withContent: number }>();
  const depthMap = new Map<number, { total: number; withContent: number }>();
  const contentMap = new Map<
    string,
    { linksCount: number; contentsCount: number; totalContent: number; hasContent: boolean }
  >();

  nodes.forEach((n) => {
    const { linksCount, contentsCount, totalContent } = getCounts(n.data);
    const hasContent = totalContent > 0;
    if (hasContent) unlocked++;

    contentMap.set(n.id, { linksCount, contentsCount, totalContent, hasContent });

    const category = normalizeCategory((n.data as { category?: unknown }).category);
    const categoryBucket = categoryMap.get(category) ?? { total: 0, withContent: 0 };
    categoryBucket.total += 1;
    if (hasContent) categoryBucket.withContent += 1;
    categoryMap.set(category, categoryBucket);

    const depth = getDepth(n.id);
    const depthBucket = depthMap.get(depth) ?? { total: 0, withContent: 0 };
    depthBucket.total += 1;
    if (hasContent) depthBucket.withContent += 1;
    depthMap.set(depth, depthBucket);
  });

  const total = nodes.length;
  const stats: OverviewStats = {
    total,
    unlocked,
    progress: total > 0 ? Math.round((unlocked / total) * 100) : 0,
  };

  const categoryData = [...categoryMap.entries()]
    .map(([category, bucket]) => ({
      category,
      total: bucket.total,
      withContent: bucket.withContent,
      pending: bucket.total - bucket.withContent,
      pct: bucket.total > 0 ? Math.round((bucket.withContent / bucket.total) * 100) : 0,
    }))
    .sort((a, b) => b.pct - a.pct);

  const depthData = [...depthMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([levelNum, bucket]) => ({
      level: `N${levelNum}`,
      levelNum,
      total: bucket.total,
      withContent: bucket.withContent,
      gap: bucket.total - bucket.withContent,
      pct: bucket.total > 0 ? Math.round((bucket.withContent / bucket.total) * 100) : 0,
    }));

  const maxGapLevel =
    depthData.length > 0
      ? depthData.reduce((best, curr) => (curr.gap > best.gap ? curr : best)).level
      : null;

  const criticalNodes = nodes
    .filter((n) => (childCount.get(n.id) ?? 0) > 0)
    .map((n) => {
      const content = contentMap.get(n.id) ?? {
        linksCount: 0,
        contentsCount: 0,
        totalContent: 0,
        hasContent: false,
      };
      return {
        id: n.id,
        name: n.data.label || n.data.name,
        icon: n.data.icon ?? '*',
        color: n.data.color ?? 'var(--text-contrast)',
        hasContent: content.hasContent,
        totalContent: content.totalContent,
        linksCount: content.linksCount,
        contentsCount: content.contentsCount,
        dependents: childCount.get(n.id) ?? 0,
      };
    })
    .sort((a, b) => b.dependents - a.dependents)
    .slice(0, 6);

  return {
    stats,
    categoryData,
    depthData,
    maxGapLevel,
    criticalNodes,
  };
}
