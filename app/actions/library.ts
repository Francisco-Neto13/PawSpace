'use server';
import * as mutations from './library/mutations';
import * as queries from './library/queries';

export async function addContent(data: any) { return mutations.addContent(data); }
export async function deleteContent(id: string) { return mutations.deleteContent(id); }
export async function uploadPdf(form: FormData, userId?: string) { return mutations.uploadPdf(form, userId); }
export async function getContentsBySkill(id: string) { return queries.getContentsBySkill(id); }
export async function getSkillsForLibrary() { return queries.getSkillsForLibrary(); }