const vscode = require("vscode");

/**
 * DocumentLinkProvider for Dockerfiles.
 * Makes FROM base image references clickable, linking to Docker Hub.
 */
class DockerfileLinkProvider {
  provideDocumentLinks(document) {
    const links = [];
    const text = document.getText();
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Match FROM instructions: FROM image:tag AS alias
      const fromMatch = line.match(/^\s*FROM\s+([^\s]+)/i);
      if (fromMatch) {
        const imageRef = fromMatch[1];
        // Skip build args like FROM ${BASE_IMAGE}
        if (imageRef.startsWith("$")) {
          continue;
        }

        // Parse image name (strip tag and digest)
        const imageName = imageRef.split(":")[0].split("@")[0];

        // Build Docker Hub URL
        let url;
        if (imageName.includes("/")) {
          // User/org image like nginx/nginx-ingress
          url = `https://hub.docker.com/r/${imageName}`;
        } else {
          // Official image like python, node, ubuntu
          url = `https://hub.docker.com/_/${imageName}`;
        }

        // Find the position of the image reference in the line
        const startIndex = line.indexOf(imageRef);
        const range = new vscode.Range(i, startIndex, i, startIndex + imageRef.length);
        const link = new vscode.DocumentLink(range, vscode.Uri.parse(url));
        link.tooltip = `Open ${imageName} on Docker Hub`;
        links.push(link);
      }

      // Match COPY --from=builder references to multi-stage build stages
      // These link to the same Dockerfile so no external link needed

      // Match image references in RUN docker pull commands
      const pullMatch = line.match(/docker\s+pull\s+([^\s]+)/);
      if (pullMatch) {
        const imageRef = pullMatch[1];
        if (imageRef.startsWith("$")) {
          continue;
        }
        const imageName = imageRef.split(":")[0].split("@")[0];
        let url;
        if (imageName.includes("/")) {
          url = `https://hub.docker.com/r/${imageName}`;
        } else {
          url = `https://hub.docker.com/_/${imageName}`;
        }
        const startIndex = line.indexOf(imageRef, line.indexOf("pull"));
        const range = new vscode.Range(i, startIndex, i, startIndex + imageRef.length);
        const link = new vscode.DocumentLink(range, vscode.Uri.parse(url));
        link.tooltip = `Open ${imageName} on Docker Hub`;
        links.push(link);
      }
    }

    return links;
  }
}

/**
 * Register the Dockerfile link provider.
 * @param {vscode.ExtensionContext} context
 */
function registerDockerfileLinks(context) {
  const provider = new DockerfileLinkProvider();
  const disposable = vscode.languages.registerDocumentLinkProvider(
    { language: "dockerfile" },
    provider
  );
  context.subscriptions.push(disposable);
}

module.exports = { registerDockerfileLinks, DockerfileLinkProvider };
