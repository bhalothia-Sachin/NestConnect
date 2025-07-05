module.exports = {
  apps: [
    {
      name: 'nestconnect-backend',
      script: './server.js',
      cwd: '/root/NestConnect/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 8787
      },
      error_file: '/root/.pm2/logs/nestconnect-backend-error.log',
      out_file: '/root/.pm2/logs/nestconnect-backend-out.log',
      log_file: '/root/.pm2/logs/nestconnect-backend-combined.log',
      time: true
    },
    {
      name: 'nestconnect-frontend',
      script: 'serve',
      args: '-s build -l 8000',
      cwd: '/root/NestConnect/frontend',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/root/.pm2/logs/nestconnect-frontend-error.log',
      out_file: '/root/.pm2/logs/nestconnect-frontend-out.log',
      time: true
    }
  ]
};
