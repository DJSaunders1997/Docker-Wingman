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
const createEnvIcon = new CustomStatusBarItem(
  "$(tools) Build Image from Dockerfile",
  "Build docker environment from open Dockerfile",
  "docker-wingman.buildDockerfile"
);
const activateEnvIcon = new CustomStatusBarItem(
  "$(symbol-event) Run Docker Image",
  "Activate docker environment referenced in open Dockerfile",
  "docker-wingman.runDockerfile"
);
//create custom status bar item to delete env
const deleteEnvIcon = new CustomStatusBarItem(
  "$(trashcan) Delete Env from Dockerfile",
  "Delete docker environment referenced in open Dockerfile",
  "docker-wingman.deleteDockerEnv"
);

// All items that participate in show/hide grouping
const allItems = [createEnvIcon, activateEnvIcon, deleteEnvIcon];

function showAllStatusBarItems() {
  for (const item of allItems) {
    item.displayDefault();
  }
}

function hideAllStatusBarItems() {
  for (const item of allItems) {
    item.statusBar.hide();
  }
}

module.exports = {
  createEnvIcon, activateEnvIcon, deleteEnvIcon,
  showAllStatusBarItems, hideAllStatusBarItems,
};
