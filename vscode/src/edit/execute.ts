import * as vscode from 'vscode'

import type { ChatEventSource, ContextFile, ContextMessage } from '@sourcegraph/cody-shared'

import type { EditIntent, EditMode } from './types'

export interface ExecuteEditArguments {
    document?: vscode.TextDocument
    instruction?: string
    userContextFiles?: ContextFile[]
    contextMessages?: ContextMessage[]
    intent?: EditIntent
    range?: vscode.Range
    mode?: EditMode
}

/**
 * Wrapper around the `edit-code` command that can be used anywhere but with better type-safety.
 */
export const executeEdit = async (
    args: ExecuteEditArguments,
    source: ChatEventSource
): Promise<void> => {
    await vscode.commands.executeCommand('cody.command.edit-code', args, source)
}
