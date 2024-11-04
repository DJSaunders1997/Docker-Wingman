const vscode = require("vscode");
const { activeFileIsDockerfile } = require("./utils");

/**
 * Class to extend the vscode createStatusBarItem with additional functionality.
 * Represents the status bar that allows users to easily create environments.
 * Choose symbols from this list https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
 */
class CustomStatusBarItem {
  constructor(defaultText, tooltip, command) {
    this.defaultText = defaultText;
    this.loadingText = this.defaultText + " $(loading~spin)";

    this.statusBar = vscode.window.createStatusBarItem(); // createStatusBarItem('createEnvStatusBar',1)
    this.statusBar.text = defaultText;
    this.statusBar.tooltip = tooltip;
    this.statusBar.command = command;

    this.displayDefault();
  }

  /***
   * Returning text to default state.
   */
  displayDefault() {
    this.statusBar.text = this.defaultText;

    if (activeFileIsDockerfile()) {
      this.statusBar.show();
    } else {
      this.statusBar.hide();
    }
  }
  /**
   * To be displayed when action is running from the button being selected.
   * Currently not implemented as the terminal api does not allow us to view status.
   * TODO: Implement loading if the terminal api allows us to view status in future.
   */
  displayLoading() {
    this.statusBar.text = this.loadingText;
    this.statusBar.show();
  }
}

// Use CustomStatusBarItem class to create status bar items
// Export the object instances and not the class
// Create custom status bar items
var createEnvIcon = new CustomStatusBarItem(
  (defaultText = "$(tools) Build Image from Dockerfile"),
  (tooltip = "Build docker environment from open Dockerfile"),
  (command = "docker-wingman.buildDockerfile")
);
var activateEnvIcon = new CustomStatusBarItem(
  (defaultText = "$(symbol-event) Run Docker Image"),
  (tooltip = "Activate docker environment referenced in open Dockerfile"),
  (command = "docker-wingman.runDockerfile")
);
//create custom status bar item to delete env
var deleteEnvIcon = new CustomStatusBarItem(
  (defaultText = "$(trashcan) Delete Env from Dockerfile"),
  (tooltip = "Delete docker environment referenced in open Dockerfile"),
  (command = "docker-wingman.deleteDockerEnv")
);

module.exports = { createEnvIcon, activateEnvIcon, writeEnvIcon, deleteEnvIcon };
