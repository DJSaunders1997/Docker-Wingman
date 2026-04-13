// This file contains the main logic for the extension

const vscode = require("vscode"); // The module 'vscode' contains the VS Code extensibility API

// Import my VSCode command functions, utility/helper functions, and custom status bar.
const {
  buildDockerfile,
  runDockerfile,
  deleteDockerContainer,
} = require("./commands");
const {
  showAllStatusBarItems,
  hideAllStatusBarItems,
} = require("./statusBarItems"); // Import initialised status bar items, because I can't pass them as arguments to command function
const { getConfig } = require("./config");
const { execSync } = require("child_process");
const { registerDockerfileLinks } = require("./documentLinks");
const { registerDockerfileHover } = require("./hoverProvider");

/**
 * Function that is run on activation of extension.
 * Here the main functionality of the function is defined.
 *
 */
function activate(context) {
  console.log('Congratulations, your extension "Docker Wingman" is now active!');

  // Check if docker is available on the system
  checkDockerAvailability();

  // Initial visibility based on config
  if (getConfig().showStatusBarItems) {
    showAllStatusBarItems();
  } else {
    hideAllStatusBarItems();
  }

  // Setup listener to see when active file is not Dockerfile
  // TODO: Can I move this to a different file?
  const listener = function (event) {
    console.log("Active window changed", event);

    // Check whether to display the status bar items every time the active file changes.
    // Logic to check if the active file is a Dockerfile is in the status bar item class.
    if (getConfig().showStatusBarItems) {
      showAllStatusBarItems();
    } else {
      hideAllStatusBarItems();
    }
  };

  const fileChangeSubscription =
    vscode.window.onDidChangeActiveTextEditor(listener);
  //subscription.dispose(); // stop listening for more active file changes

  // Listen for config changes to toggle status bar visibility
  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("dockerWingman")) {
      if (getConfig().showStatusBarItems) {
        showAllStatusBarItems();
      } else {
        hideAllStatusBarItems();
      }
    }
  });

  // Register VSCODE commands as functions defined in other files.
  // TODO: Add icons to the function here as arguments somehow instead of using global variables?
  const buildCommand = vscode.commands.registerCommand(
    "docker-wingman.buildDockerfile",
    buildDockerfile
  );
  const activateCommand = vscode.commands.registerCommand(
    "docker-wingman.runDockerfile",
    runDockerfile
  );
  // TODO: Implement deleteDockerEnv
  const deleteCommand = vscode.commands.registerCommand(
    "docker-wingman.deleteDockerEnv",
    deleteDockerContainer
  );

  // Register clickable links for FROM base images → Docker Hub
  registerDockerfileLinks(context);

  // Register hover tooltips showing Docker Hub image info
  registerDockerfileHover(context);

  context.subscriptions.push(
    buildCommand, activateCommand, deleteCommand,
    fileChangeSubscription, configListener
  );
}

/**
 * Check if docker is available on the system and show a warning if not.
 */
function checkDockerAvailability() {
  try {
    execSync("docker --version", { stdio: "ignore" });
  } catch {
    vscode.window.showWarningMessage(
      "Docker Wingman: 'docker' was not found on your PATH. Commands will not work until Docker is installed."
    );
  }
}

// this method is called when your extension is deactivated
function deactivate() {
  //fileChangeSubscription.dispose(); // stop listening for more active file changes
}

module.exports = {
  activate,
  deactivate,
};
