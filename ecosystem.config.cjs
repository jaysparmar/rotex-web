// PM2 process file for rotex-app (standalone: no deploy/deploy.config or .deploy.env needed).
// Start by hand with: pm2 start ecosystem.config.cjs
// Any value below can be overridden by an environment variable of the same name.
const path = require('path')

const APP_NAME = process.env.APP_NAME || 'rotex-app'
const PORT = process.env.APP_PORT || '5007'
const INSTANCES = process.env.PM2_INSTANCES || '2'
const MAX_MEMORY = process.env.PM2_MAX_MEMORY || '5000M'

// App lives in the same folder as this file (set APP_DIR to override).
const appDir = process.env.APP_DIR || __dirname

let nextBin
try {
  nextBin = require.resolve('next/dist/bin/next', { paths: [appDir] })
} catch {
  nextBin = path.join(appDir, 'node_modules', 'next', 'dist', 'bin', 'next')
}

module.exports = {
  apps: [
    {
      name: APP_NAME,
      cwd: appDir, // Next.js reads .env / .env.production from here at start
      script: nextBin,
      args: `start -p ${PORT}`,
      // SQLite needs a single writer: keep 1 instance (fork mode).
      instances: INSTANCES === 'max' ? 'max' : Number(INSTANCES),
      exec_mode: INSTANCES === '1' ? 'fork' : 'cluster',
      max_memory_restart: MAX_MEMORY,
      env: {
        NODE_ENV: 'production',
        PORT: PORT,
        NODE_OPTIONS: '--no-deprecation',
      },
    },
  ],
}
