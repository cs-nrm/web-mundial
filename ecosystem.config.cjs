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
    }
  ]
};
