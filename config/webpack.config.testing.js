const { resolve } = require("path");
const baseConfig = require("./webpack.config.base");

module.exports = {
  entry: resolve(__dirname, "../test/test_entrypoint.js"),
  output: {
    path: resolve(__dirname, "../build_testing"),
    filename: "spec_bundle.js",
  },
  mode: "development",
  ...baseConfig,
};
