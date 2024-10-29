const vscode = require("vscode");
const fs = require("fs");

// Terminal Functions copied from microsoft example terminal API
// https://github.com/microsoft/vscode-extension-samples/blob/main/terminal-sample/src/extension.ts
// Examples are given in TypeScript, so converted to JavaScript with an online converter https://extendsclass.com/typescript-to-javascript.html
// Function created by me to encapsulate the example terminalapi.sendText VSCode command
function sendCommandToTerminal(command) {
  // If there is no active terminal then create one
  // Then read in the active terminal for us to use
  var terminal = vscode.window.activeTerminal;

  if (typeof terminal == "undefined") {
    vscode.window.showInformationMessage(
      "No active terminal found. Creating new terminal."
    );
    console.log("No active terminal found. Creating new terminal.");
    var terminal = vscode.window.createTerminal();
  }

  // Send command to active/new terminal
  terminal.show();
  terminal.sendText(command);

  console.log(`Command '${command}' sent to terminal`);
}

// Helper function to check if active file is a Dockerfile
// Return true if the active file is a Dockerfile
function activeFileIsDockerfile() {
  var activeFilename = vscode.window.activeTextEditor.document.fileName;

  // split string by / or \ to get the file name (to handle cross-platform paths)
  var fileName = activeFilename.split(/[/\\]/).pop();

  // Check if the file name matches "Dockerfile" or starts with "Dockerfile."
  if (fileName.toLowerCase() == "dockerfile" || fileName.toLowerCase().startsWith("dockerfile.")) {
    return true;
  } else {
    return false;
  }
}

/**
 *
 * @param {string} filenameForwardSlash : filename or path to Dockerfile environment file.
 *
 * Function will read the specified Dockerfile file and pick out the "name" value.
 * @returns {string} The name of the environment.
 */
function getEnvNameFromDockerfile(filenameForwardSlash) {
  try {
    const DockerfileDoc = Dockerfile.load(fs.readFileSync(filenameForwardSlash, "utf8"));
    console.log(DockerfileDoc);

    var env_name = DockerfileDoc["name"];
    return env_name;
  } catch (e) {
    console.error("Error parsing the Dockerfile", e);
    return null;
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
  var activeEditor = vscode.window.activeTextEditor;
  var filename = activeEditor.document.fileName;

  console.log(`Filename is :${filename}`);

  // Convert file path \\ characters to /
  var filenameForwardSlash = filename.split("\\").join("/");
  console.log(`Amended filename is :${filenameForwardSlash}`);

  return filenameForwardSlash;
}

/**
 *
 * @param {string} filenameForwardSlash : filename or path to Dockerfile environment file.
 *
 * Function will read the specified Dockerfile file and pick out the "name" value.
 * Then attempts to activate this environment with the terminal.
 */
function activateEnvFromDockerfile(filenameForwardSlash) {
  // Send to terminal the command to activate the environment too
  try {
    var env_name = getEnvNameFromDockerfile(filenameForwardSlash);

    vscode.window.showInformationMessage(`Activating ${env_name} .`);
    console.log(`Activating ${env_name} .`);

    // Run the docker create environment command
    var command = `docker activate ${env_name}`;
    sendCommandToTerminal(command);
  } catch (e) {
    vscode.window.showErrorMessage("Error parsing the Dockerfile"); //TODO: Add better error handling to Release Logs
    console.log("Error parsing the Dockerfile");
    console.log(e);
  }
}

/**
 *
 * @param {string} filenameForwardSlash : filename or path to Dockerfile environment file.
 *
 * Function will read the specified Dockerfile file and pick out the "name" value.
 * Then attempts to delete this environment with the terminal.
 */
function deleteEnvFromDockerfile(filenameForwardSlash) {
  try {
    var env_name = getEnvNameFromDockerfile(filenameForwardSlash);

    vscode.window.showInformationMessage(`Deleting ${env_name} .`);
    console.log(`Deleting ${env_name} .`);

    // Env to be deleted can't be active when deleting
    // therefore deactivate any env first.
    var deactivateCommand = 'docker deactivate';
    sendCommandToTerminal(deactivateCommand);

    // Run the docker delete environment command
    var command = `docker env remove --name ${env_name}`;
    sendCommandToTerminal(command);
  } catch (e) {
    vscode.window.showErrorMessage("Error parsing the Dockerfile");
    console.log("Error parsing the Dockerfile");
    console.log(e);
  }
}

/**
 * Shows an input box using window.showInputBox().
 * Higher level wrapper around vscode.window.showInputBox
 * Source: https://stackoverflow.com/questions/55854519/how-to-ask-user-for-username-or-other-data-with-vs-code-extension-api
 */
async function createDockerfileInputBox(defaultValue) {
  const result = await vscode.window.showInputBox({
    value: defaultValue,
    placeHolder: "Name of created docker environment Dockerfile",
    validateInput: (text) => {
      if (text.length == 0) {
        return "You cannot leave this empty!";
      }
      var fileExt = text.split(".").pop().toLowerCase();

      if (fileExt != "Dockerfile" && fileExt != "yml") {
        return `Only Dockerfiles are supported!`;
      }
    },
  });
  console.log("Running asynchronous createDockerfileInputBox function ");

  console.log(`Got: ${result}`);
  if (result == undefined) {
    vscode.window.showErrorMessage(
      `Cannot create requirements file if no name is given.`
    );
  } else {
    vscode.window.showInformationMessage(
      `Creating requirements file Env:\n'${result}' .`
    );
    console.log(`Creating requirements file Env:\n'${result}' .`);

    // Run the docker create environment command
    var command = `docker env export > "${result}"`;
    sendCommandToTerminal(command);
  }
}

function buildImageFromDockerfile(dockerfilePath, imageName) {
  try {
    vscode.window.showInformationMessage(`Building Docker image from Dockerfile: ${dockerfilePath}.`);
    console.log(`Building Docker image from Dockerfile: ${dockerfilePath}.`);

    // Run the docker build command
    var command = `docker build -t ${imageName} -f ${dockerfilePath} .`;
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
    var command = `docker run --name ${containerName} ${imageName}`;
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
    var stopCommand = `docker stop ${containerName}`;
    sendCommandToTerminal(stopCommand);

    // Run the docker rm command to remove the container
    var removeCommand = `docker rm ${containerName}`;
    sendCommandToTerminal(removeCommand);
  } catch (e) {
    vscode.window.showErrorMessage("Error stopping or removing the Docker container");
    console.log("Error stopping or removing the Docker container");
    console.log(e);
  }
}

async function createDockerfileInputBox(defaultValue) {
  const result = await vscode.window.showInputBox({
    value: defaultValue,
    placeHolder: "Name of the Dockerfile",
    validateInput: (text) => {
      if (text.length == 0) {
        return "You cannot leave this empty!";
      }
      if (!text.toLowerCase().startsWith("dockerfile")) {
        return `The file must be a Dockerfile!`;
      }
    },
  });
  console.log("Running asynchronous createDockerfileInputBox function ");

  console.log(`Got: ${result}`);
  if (result == undefined) {
    vscode.window.showErrorMessage(
      `Cannot proceed without a Dockerfile name.`
    );
  } else {
    vscode.window.showInformationMessage(
      `Using Dockerfile:\n'${result}' .`
    );
    console.log(`Using Dockerfile:\n'${result}' .`);
  }
}

module.exports = {
  sendCommandToTerminal,
  activeFileIsDockerfile,
  runContainerFromImage,
  stopAndRemoveContainer,
  buildImageFromDockerfile,
  getOpenDocumentPath,
  activateEnvFromDockerfile,
  createDockerfileInputBox,
  deleteEnvFromDockerfile
};
