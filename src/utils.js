const vscode = require("vscode");

// Terminal Functions copied from microsoft example terminal API
// https://github.com/microsoft/vscode-extension-samples/blob/main/terminal-sample/src/extension.ts
// Examples are given in TypeScript, so converted to JavaScript with an online converter https://extendsclass.com/typescript-to-javascript.html
// Function created by me to encapsulate the example terminalapi.sendText VSCode command
function sendCommandToTerminal(command) {
  if (!command) {
    console.log("No command provided to sendCommandToTerminal");
    return;
  }

  // If there is no active terminal then create one
  // Then read in the active terminal for us to use
  let terminal = vscode.window.activeTerminal;

  if (typeof terminal == "undefined") {
    vscode.window.showInformationMessage(
      "No active terminal found. Creating new terminal."
    );
    console.log("No active terminal found. Creating new terminal.");
    terminal = vscode.window.createTerminal();
  }

  // Send command to active/new terminal
  terminal.show();
  terminal.sendText(command);

  console.log(`Command '${command}' sent to terminal`);
}

// Helper function to check if active file is a Dockerfile
// Return true if the active file is a Dockerfile
function activeFileIsDockerfile() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return false;
  }
  const activeFilename = editor.document.fileName;

  // split string by / or \ to get the file name (to handle cross-platform paths)
  const fileName = activeFilename.split(/[/\\]/).pop();

  // Check if the file name matches "Dockerfile" or starts with "Dockerfile."
  if (fileName.toLowerCase() == "dockerfile" || fileName.toLowerCase().startsWith("dockerfile.")) {
    return true;
  } else {
    return false;
  }
}


/**
 *
 * @returns the filepath of the open document
 *
 * Reads the current open document, and converts the path into a more friendly format.
 * TODO: Find out what happens if there is no open document
 * TODO: make this OS agnostic, as I'm sure this only effects windows atm.
 */
function getOpenDocumentPath() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    vscode.window.showErrorMessage("No active editor found.");
    return null;
  }
  const filename = activeEditor.document.fileName;

  console.log(`Filename is :${filename}`);

  // Convert file path \\ characters to /
  const filenameForwardSlash = filename.split("\\").join("/");
  console.log(`Amended filename is :${filenameForwardSlash}`);

  return filenameForwardSlash;
}


function buildImageFromDockerfile(dockerfilePath, imageName) {
  try {
    vscode.window.showInformationMessage(`Building Docker image from Dockerfile: ${dockerfilePath}.`);
    console.log(`Building Docker image from Dockerfile: ${dockerfilePath}.`);

    // Run the docker build command
    const command = `docker build -t ${imageName} -f ${dockerfilePath} .`;
    sendCommandToTerminal(command);
  } catch (e) {
    vscode.window.showErrorMessage("Error building the Docker image");
    console.log("Error building the Docker image");
    console.log(e);
  }
}

function runContainerFromImage(imageName, containerName) {
  try {
    vscode.window.showInformationMessage(`Running Docker container: ${containerName} from image: ${imageName}.`);
    console.log(`Running Docker container: ${containerName} from image: ${imageName}.`);

    // Run the docker run command
    const command = `docker run --name ${containerName} ${imageName}`;
    sendCommandToTerminal(command);
  } catch (e) {
    vscode.window.showErrorMessage("Error running the Docker container");
    console.log("Error running the Docker container");
    console.log(e);
  }
}

function stopAndRemoveContainer(containerName) {
  try {
    vscode.window.showInformationMessage(`Stopping and removing Docker container: ${containerName}.`);
    console.log(`Stopping and removing Docker container: ${containerName}.`);

    // Stop the container if it's running
    const stopCommand = `docker stop ${containerName}`;
    sendCommandToTerminal(stopCommand);

    // Run the docker rm command to remove the container
    const removeCommand = `docker rm ${containerName}`;
    sendCommandToTerminal(removeCommand);
  } catch (e) {
    vscode.window.showErrorMessage("Error stopping or removing the Docker container");
    console.log("Error stopping or removing the Docker container");
    console.log(e);
  }
}

/**
 * Returns the path to the first workspace folder, or null if none.
 */
function getFirstWorkspaceFolder() {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return null;
  }
  return folders[0].uri.fsPath;
}

module.exports = {
  sendCommandToTerminal,
  activeFileIsDockerfile,
  runContainerFromImage,
  stopAndRemoveContainer,
  buildImageFromDockerfile,
  getOpenDocumentPath,
  getFirstWorkspaceFolder,
};
