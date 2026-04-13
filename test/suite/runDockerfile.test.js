const assert = require('assert');
const vscode = require('vscode');

suite('Run Dockerfile Tests', () => {
    test('Run Docker Container Command is registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('docker-wingman.runDockerfile'));
    });
});