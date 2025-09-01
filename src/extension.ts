import * as vscode from 'vscode';
import { manifestFactory } from './manifest';
import { shbPluginRegister } from '@shenghuabi/sdk';

let dispose$$: Promise<() => {}> | undefined;
// 入口
export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('插件已激活');
  dispose$$ = shbPluginRegister(context, manifestFactory({}));
}
export function deactivate() {
  dispose$$?.then((fn) => fn());
}
