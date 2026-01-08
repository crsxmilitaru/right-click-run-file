const vscode = require('vscode');
const path = require('path');

/**
 * Activates the extension.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
function activate(context) {
  const runNormal = vscode.commands.registerCommand('right-click-run-file.run', (uri) => {
    executeFile(uri, false);
  });

  const runAdmin = vscode.commands.registerCommand('right-click-run-file.runAdmin', (uri) => {
    executeFile(uri, true);
  });

  context.subscriptions.push(runNormal, runAdmin);
}

/**
 * Executes the selected file in the integrated terminal.
 * @param {vscode.Uri} [uri] - The URI of the selected file.
 * @param {boolean} asAdmin - Whether to run the file with administrator privileges.
 */
function executeFile(uri, asAdmin) {
  if (!uri) {
    if (vscode.window.activeTextEditor) {
      uri = vscode.window.activeTextEditor.document.uri;
    } else {
      vscode.window.showErrorMessage('No file selected.');
      return;
    }
  }

  const filePath = uri.fsPath;
  const fileName = path.basename(filePath);
  const folder = vscode.workspace.getWorkspaceFolder(uri);

  const isWindows = process.platform === 'win32';
  let command;

  if (isWindows) {
    command = asAdmin
      ? `Start-Process -FilePath "${filePath}" -Verb RunAs`
      : `& "${filePath}"`;
  } else {
    command = asAdmin
      ? `sudo "${filePath}"`
      : `"${filePath}"`;
  }

  const task = new vscode.Task(
    { type: 'shell' },
    folder || vscode.TaskScope.Workspace,
    asAdmin ? `Run ${fileName} (Admin)` : `Run ${fileName}`,
    'right-click-run-file',
    new vscode.ShellExecution(command)
  );

  task.presentationOptions = {
    reveal: vscode.TaskRevealKind.Always,
    panel: vscode.TaskPanelKind.Dedicated,
    focus: true,
    clear: true
  };

  vscode.tasks.executeTask(task);
}

/**
 * Deactivates the extension.
 */
function deactivate() { }

module.exports = {
  activate,
  deactivate
};
