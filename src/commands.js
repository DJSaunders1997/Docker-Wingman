const vscode = require("vscode");
const path = require("path");

const {
  getOpenDocumentPath,
  buildImageFromDockerfile,
  runContainerFromImage,
  stopAndRemoveContainer,
} = require("./utils");
const {
  activateEnvIcon,
  deleteEnvIcon,
} = require("./statusBarItems"); // TODO: Make these arguments to the functions

// TODO: Rename to build docker image
function buildDockerfile() {
  const dockerfilePath = getOpenDocumentPath();
  if (!dockerfilePath) { return; }

  // if (activeFileIsDockerfile()) {
  if (dockerfilePath.toLowerCase().includes("dockerfile")) {
    vscode.window.showInformationMessage(
      `Building Docker image from ${dockerfilePath}\n This may take a few moments...`
    );
    // console.log(activeFileIsDockerfile()
    console.log(
      `Building Docker image from ${dockerfilePath}\n This may take a few moments...`
    );

    // Extract the repository name from the Dockerfile path
    const repoName = path.basename(path.dirname(dockerfilePath));

    // Prompt user for container name with default value as repo name
    vscode.window
      .showInputBox({
        prompt: "Enter image name:",
        value: `${repoName.toLowerCase()}-image`, // Default to repoName-image
      })
      .then((imageName) => {
        // Convert imageName to lowercase
        buildImageFromDockerfile(dockerfilePath, imageName.toLowerCase());
        activateEnvIcon.displayDefault();
      });
  } else {
    const activeFilename = vscode.window.activeTextEditor.document.fileName;
    const fileExt = activeFilename.split(".").pop();
    vscode.window.showErrorMessage(
      `Cannot build Docker image from a ${fileExt} file. Only Dockerfiles are supported.`
    );
  }
}

function runDockerfile() {
  const dockerfilePath = getOpenDocumentPath();
  if (!dockerfilePath) { return; }

  if (dockerfilePath.toLowerCase().includes("dockerfile")) {
    vscode.window.showInformationMessage(
      `Running Docker container from image built by ${dockerfilePath}`
    );
    console.log(
      `Running Docker container from image built by ${dockerfilePath}`
    );

    // Extract the repository name from the Dockerfile path
    const repoName = path.basename(path.dirname(dockerfilePath));

    // First prompt for image name
    vscode.window
      .showInputBox({
        prompt: "Enter image name:",
        value: `${repoName.toLowerCase()}-image`, // Default to repoName-image
      })
      .then((imageName) => {
        // If image name is provided, prompt for container name
        if (imageName) {
          return vscode.window
            .showInputBox({
              prompt: "Enter container name:",
              value: `${repoName.toLowerCase()}-container`, // Default to repoName-container
            })
            .then((containerName) => ({ imageName, containerName }));
        }
      })
      .then((names) => {
        // If both names were provided, proceed to run container
        if (names && names.containerName) {
          runContainerFromImage(
            names.imageName.toLowerCase(),
            names.containerName.toLowerCase()
          );
          activateEnvIcon.displayDefault();
        }
      });
  } else {
    //TODO: Change else to early exit condition
    const activeFilename = vscode.window.activeTextEditor.document.fileName;
    const fileExt = activeFilename.split(".").pop();
    vscode.window.showErrorMessage(
      `Cannot run Docker container from a ${fileExt} file. Only Dockerfiles are supported.`
    );
  }
}

//TODO:Implement delete and write functionality
// These are dodgily defined, but arnt registered and dont work

function deleteDockerContainer() {
  const dockerfilePath = getOpenDocumentPath();
  if (!dockerfilePath) { return; }

  // Extract the repository name from the Dockerfile path
  const repoName = path.basename(path.dirname(dockerfilePath));

  // Prompt user for container name with default value as repo name
  vscode.window
    .showInputBox({
      prompt: "Enter container name to delete:",
      value: repoName, // Set default value to repo name
    })
    .then((containerName) => {
      if (containerName) {
        stopAndRemoveContainer(containerName);
        deleteEnvIcon.displayDefault();
      }
    });
}
module.exports = {
  buildDockerfile,
  runDockerfile,
  deleteDockerContainer,
};
