const vscode = require("vscode");

/**
 * Reads all dockerWingman.* settings and returns them as a plain object.
 */
function getConfig() {
  const cfg = vscode.workspace.getConfiguration("dockerWingman");
  return {
    showStatusBarItems: cfg.get("showStatusBarItems", true),
  };
}

module.exports = { getConfig };
