const assert = require('assert');
const vscode = require('vscode');
const sinon = require('sinon');

suite('Build Dockerfile Tests', () => {
    let sandbox;

    // Setup a sandbox for sinon before each test to manage stubs/spies
    // Sandbox: Using a sandbox from sinon helps manage multiple stubs and spies, ensuring that after each test, all modifications are reset.
    // This prevents tests from interfering with each other.
    setup(() => {
        sandbox = sinon.createSandbox();
    });

    // Restore the sandbox to clean up all stubs/spies after each test
    teardown(() => {
        sandbox.restore();
    });

    test('Build Docker Image Command is registered', async () => {
        // Verify the command is registered and can be executed
        const commands = await vscode.commands.getCommands(true);
        assert.ok(commands.includes('docker-wingman.buildDockerfile'));
    });
});