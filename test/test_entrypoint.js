/**
 * Import all files in a directory matching a pattern, and do it recursively.
 *
 * This is webpack specific syntax and the arguments to require.context must be
 * literals since this is transformed while webpack parses.
 */
const contextualRequire = require.context("./", true, /\.spec\.js$/);
contextualRequire.keys().forEach(contextualRequire);
