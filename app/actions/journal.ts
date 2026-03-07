'use server';

import * as mutations from './journal/mutations';
import * as queries from './journal/queries';
import type { JournalInput } from './journal/types';

export async function saveJournalEntry(data: JournalInput) { 
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
