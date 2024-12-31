module.exports = {
  apps: [
    {
      name: "react-app",
      script: "npm",
      args: "start",
      cwd: "./", // Direktori proyek React
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "node-server",
      script: "server.js",
      cwd: "./", // Ganti dengan direktori root proyek
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      log_type: "json",
      merge_logs: true,
      output: "./logs/out.log",
      error: "./logs/error.log",
    }
    
  ],
};
