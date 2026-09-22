import { routes, type VercelConfig } from '@vercel/config/v1'

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  installCommand: 'npm install',

  // Cron Jobs
  crons: [
    {
      path: '/api/cleanup',
      schedule: '0 0 * * *', // Daily at 00:00 UTC
    },
  ],

  // Environment Variables (production defaults)
  env: {
    NODE_ENV: 'production',
  },
}
