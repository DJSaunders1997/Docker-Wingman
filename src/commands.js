const vscode = require("vscode");
var path = require("path");

const {
  sendCommandToTerminal,
  activeFileIsDockerfile,
  getOpenDocumentPath,
  buildImageFromDockerfile,
  runContainerFromImage,
  stopAndRemoveContainer,
  createDockerfileInputBox,
} = require("./utils");
const {
  createEnvIcon,
  activateEnvIcon,
  writeEnvIcon,
  deleteEnvIcon,
} = require("./statusBarItems"); // TODO: Make these arguments to the functions

// TODO: Rename to build docker image
function buildDockerfile() {
  const dockerfilePath = getOpenDocumentPath();

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
// Command: "Docker Wingman: Create a Dockerfile"
// This command will create a Dockerfile with a name input from the user.
async function createDockerfile() {
  // Use current filename as default value if possible.
  var filepath = vscode.window.activeTextEditor.document.fileName;
  var filename = path.parse(filepath).base;

  if (
    filepath == "undefined" ||
    !filename.toLowerCase().includes("dockerfile")
  ) {
    filename = "Dockerfile";
  }

  // Get response from user as to what to call their Dockerfile.
  var response = await createDockerfileInputBox(filename);
  console.log("Response: ", response);

  writeEnvIcon.displayDefault();
}

module.exports = {
  buildDockerfile,
  runDockerfile,
  createDockerfile,
  deleteDockerContainer,
};
