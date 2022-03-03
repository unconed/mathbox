module.exports = function (config) {
  config.set({
    browsers: ["Chrome"],
    files: [
      "./build_testing/spec_bundle.js",
      "node_modules/shadergraph/build/*.css",
      "./src/splash.css",
    ],
    frameworks: ["jasmine"],
    autoWatch: true,
    singleRun: false,
    reporters: ["progress"],
    port: 9876,
    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,
  });
};
