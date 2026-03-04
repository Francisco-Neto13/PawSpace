export const LIMITS = {
  skill: {
    name:        50,
    description: 200,
  },
  library: {
    title: 80,
    url:   500,
    body:  2000,
  },
  journal: {
    title: 80,
    body:  10000,
  },
  quantity: {
    skillsPerUser:   50,
    contentsPerNode: 10,
    journalEntries:  30,
  },
} as const;