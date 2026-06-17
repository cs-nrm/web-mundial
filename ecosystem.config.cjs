module.exports = {
  apps: [
    {
      name: "web-mundial",
      script: "./dist/server/entry.mjs",
      cwd: "/var/www/web-mundial",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: "4321"
      },
      max_memory_restart: "512M",
      time: true
    },
    {
      name: "goal-bot",
      script: "./scripts/goal-bot/index.js",
      cwd: "/var/www/web-mundial",
      interpreter: "node",
      interpreter_args: "--env-file=.env",
      watch: false,
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 20,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/goal-bot-error.log",
      out_file: "logs/goal-bot.log",
      merge_logs: true,
      time: true
    }
  ]
};
