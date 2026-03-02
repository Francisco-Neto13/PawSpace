'use server';

import * as mutations from './journal/mutations';
import * as queries from './journal/queries';

export async function saveJournalEntry(data: any) { 
  return mutations.saveJournalEntry(data); 
}

export async function deleteJournalEntry(id: string) { 
  return mutations.deleteJournalEntry(id); 
}

export async function getJournalEntries() { 
  return queries.getJournalEntries(); 
}

export async function getJournalEntryById(id: string) { 
  return queries.getJournalEntryById(id); 
}