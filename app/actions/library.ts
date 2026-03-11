'use server';
import * as mutations from './library/mutations';
import * as queries from './library/queries';
import type { ContentInput } from './library/types';

export async function addContent(data: ContentInput) { return mutations.addContent(data); }
export async function deleteContent(id: string) { return mutations.deleteContent(id); }
export async function uploadPdf(form: FormData) { return mutations.uploadPdf(form); }
export async function getContentsBySkill(id: string) { return queries.getContentsBySkill(id); }
export async function getAllContentsForLibrary() { return queries.getAllContentsForLibrary(); }
export async function getSkillsForLibrary() { return queries.getSkillsForLibrary(); }
export async function getLibraryTypeStats() { return queries.getLibraryTypeStats(); }

export type LibraryTypeStatsResult = queries.LibraryTypeStatsResult;
