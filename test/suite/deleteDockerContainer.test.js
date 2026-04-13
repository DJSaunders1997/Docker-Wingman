const assert = require('assert');
const vscode = require('vscode');

suite('Delete Docker Container Tests', () => {
    test('Delete Docker Container Command is registered', async () => {
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('docker-wingman.deleteDockerEnv'));
    });
});