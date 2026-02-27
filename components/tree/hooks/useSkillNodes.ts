'use client';
import { useEffect, useRef } from 'react';
import { useSkillTreeContext } from '../context/SkillTreeContext';

export function useSkillNodes(initialSkills?: any[]) {
  const { loadTreeData, isLoading, nodes, edges, setInitialData } = useSkillTreeContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (initialSkills && initialSkills.length > 0) {
      setInitialData(initialSkills);
    } else {
      loadTreeData();
    }
  }, []); 

  return {
    isLoading: nodes.length === 0 && isLoading,
    nodes,
    edges,
  };
}