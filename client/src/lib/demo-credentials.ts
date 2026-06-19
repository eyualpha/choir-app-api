/** Portfolio demo accounts — must match server/scripts/seed-demo.js */
export const DEMO_CREDENTIALS = {
  admin: {
    email: "demo.admin@harmoniq.app",
    password: "DemoAdmin2026!",
    label: "Admin (full access)",
  },
  member: {
    email: "demo.member@harmoniq.app",
    password: "DemoMember2026!",
    label: "Member (choir view)",
  },
} as const;
