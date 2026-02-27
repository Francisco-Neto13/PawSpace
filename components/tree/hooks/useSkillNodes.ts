// hooks/useSkillNodes.ts
import { useEffect } from 'react';
import { useSkillTreeContext } from '../context/SkillTreeContext';

export function useSkillNodes() {
  const { loadTreeData, isLoading, nodes, edges } = useSkillTreeContext();

  useEffect(() => {
    loadTreeData();
  }, []); 

  return { isLoading, nodes, edges };
}