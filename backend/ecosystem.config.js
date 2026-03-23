module.exports = {
  apps: [
    {
      name: 'election-backend',
      script: 'npx',
      args: 'tsx index.ts',
      cwd: '/var/www/election-bde/backend',

      // Variables d'environnement — chargées depuis .env par dotenv/config
      env: {
        NODE_ENV: 'production',
        PORT: 2005,
      },

      // Restart automatique
      watch: false,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',

      // Logs
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',

      // Redémarre auto si dépasse 500MB RAM
      max_memory_restart: '500M',
    },
  ],
};
