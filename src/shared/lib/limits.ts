export const LIMITS = {
  auth: {
    displayName: 40,
    email: 254,
    password: 72,
    avatarSourceMaxBytes: 6 * 1024 * 1024,
    avatarMaxBytes: 500 * 1024,
    avatarMaxDimension: 512,
  },
  skill: {
    name:        50,
    description: 200,
  },
  library: {
    title:       80,
    url:         500,
    body:        2000,
    pdfMaxBytes: 10 * 1024 * 1024, // 10 MB
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
