module.exports = {
    apps: [
      {
        name: "my-react-remix-app",
        script: "./node_modules/.bin/remix-serve",
        args: "./build/server/index.js",
        instances: "max",
        exec_mode: "cluster",
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };
  