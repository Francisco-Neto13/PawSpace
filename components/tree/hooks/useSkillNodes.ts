'use client';
import { useEffect } from 'react';
import { useSkillTreeContext } from '../context/SkillTreeContext';

export function useSkillNodes(initialSkills?: any[]) {
  const { loadTreeData, isLoading, nodes, edges, setInitialData } = useSkillTreeContext();

  useEffect(() => {
    if (initialSkills && initialSkills.length > 0 && nodes.length === 0) {
      setInitialData(initialSkills);
    } 
    else if (nodes.length === 0 && !isLoading) {
      loadTreeData();
    }
  }, [initialSkills, nodes.length, setInitialData, loadTreeData, isLoading]); 

  return { 
    isLoading: nodes.length === 0 && isLoading, 
    nodes, 
    edges 
  };
}