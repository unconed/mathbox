const { resolve } = require("path");
const baseConfig = require("./webpack.config.base");

module.exports = {
  ...baseConfig,
  entry: resolve(__dirname, "../src/docs/generate.js"),
  output: {
    path: resolve(__dirname, "../build_docs"),
    filename: "generate.js",
  },
  mode: "development",
};
