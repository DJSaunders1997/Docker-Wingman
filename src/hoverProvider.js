const vscode = require("vscode");
const https = require("https");

// Cache for Docker Hub API responses (10 min TTL)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000;

/**
 * Fetch image info from Docker Hub API.
 * Returns { description, starCount, pullCount, lastUpdated } or null.
 */
function fetchDockerHubInfo(imageName) {
  const cached = cache.get(imageName);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return Promise.resolve(cached.data);
  }

  // Docker Hub API endpoint differs for official vs user images
  let apiUrl;
  if (imageName.includes("/")) {
    apiUrl = `https://hub.docker.com/v2/repositories/${imageName}/`;
  } else {
    apiUrl = `https://hub.docker.com/v2/repositories/library/${imageName}/`;
  }

  return new Promise((resolve) => {
    https.get(apiUrl, { headers: { "User-Agent": "DockerWingman-VSCode" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const info = {
            description: json.description || json.short_description || "",
            starCount: json.star_count || 0,
            pullCount: json.pull_count || 0,
            lastUpdated: json.last_updated || "",
          };
          cache.set(imageName, { data: info, time: Date.now() });
          resolve(info);
        } catch {
          resolve(null);
        }
      });
      res.on("error", () => resolve(null));
    }).on("error", () => resolve(null));
  });
}

/**
 * Format a large number with commas for readability.
 */
function formatNumber(num) {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + "B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + "K";
  }
  return String(num);
}

/**
 * HoverProvider for Dockerfiles.
 * Shows Docker Hub info when hovering over FROM image references.
 */
class DockerfileHoverProvider {
  async provideHover(document, position) {
    const line = document.lineAt(position.line).text;

    // Match FROM instructions
    const fromMatch = line.match(/^\s*FROM\s+([^\s]+)/i);
    if (!fromMatch) {
      return null;
    }

    const imageRef = fromMatch[1];
    if (imageRef.startsWith("$")) {
      return null;
    }

    // Check if cursor is over the image reference
    const startIndex = line.indexOf(imageRef);
    const endIndex = startIndex + imageRef.length;
    if (position.character < startIndex || position.character > endIndex) {
      return null;
    }

    const imageName = imageRef.split(":")[0].split("@")[0];
    const tag = imageRef.includes(":") ? imageRef.split(":")[1] : "latest";

    const info = await fetchDockerHubInfo(imageName);

    // Build Docker Hub URL
    let hubUrl;
    if (imageName.includes("/")) {
      hubUrl = `https://hub.docker.com/r/${imageName}`;
    } else {
      hubUrl = `https://hub.docker.com/_/${imageName}`;
    }

    const md = new vscode.MarkdownString();
    md.isTrusted = true;
    md.supportHtml = true;

    md.appendMarkdown(`**🐳 ${imageName}**:${tag}\n\n`);

    if (info) {
      if (info.description) {
        md.appendMarkdown(`${info.description}\n\n`);
      }
      md.appendMarkdown(`⭐ ${formatNumber(info.starCount)} stars · `);
      md.appendMarkdown(`📥 ${formatNumber(info.pullCount)} pulls\n\n`);
      if (info.lastUpdated) {
        const date = new Date(info.lastUpdated).toLocaleDateString();
        md.appendMarkdown(`Last updated: ${date}\n\n`);
      }
    }

    md.appendMarkdown(`[View on Docker Hub](${hubUrl})`);

    const range = new vscode.Range(
      position.line, startIndex,
      position.line, endIndex
    );

    return new vscode.Hover(md, range);
  }
}

/**
 * Register the Dockerfile hover provider.
 * @param {vscode.ExtensionContext} context
 */
function registerDockerfileHover(context) {
  const provider = new DockerfileHoverProvider();
  const disposable = vscode.languages.registerHoverProvider(
    { language: "dockerfile" },
    provider
  );
  context.subscriptions.push(disposable);
}

module.exports = { registerDockerfileHover, DockerfileHoverProvider };
