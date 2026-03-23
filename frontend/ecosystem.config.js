module.exports = {
  apps: [
    {
      name: 'election-frontend',
      script: 'npx',
      args: 'serve dist --listen 3005 --single',
      // --single : toutes les routes inconnues → index.html (nécessaire pour React Router)
      cwd: '/var/www/election-bde/frontend',

      env: {
        NODE_ENV: 'production',
      },

      // Restart automatique
      watch: false,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',

      // Logs
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      max_memory_restart: '200M',
    },
  ],
};
