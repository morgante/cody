import * as vscode from 'vscode'

import type { CodyCommand, ContextMessage } from '@sourcegraph/cody-shared'

import { VSCodeEditorContext } from '../../editor-context/VSCodeEditorContext'
import type { VSCodeEditor } from '../../editor/vscode-editor'
import { logDebug } from '../../log'
import { extractTestType } from '../prompt/utils'

export const getContextForCommand = async (
    editor: VSCodeEditor,
    command: CodyCommand
): Promise<ContextMessage[]> => {
    logDebug('getContextForCommand', 'getting context')
    const contextConfig = command.context || { codebase: false }
    // Get smart selection if selection is required
    const smartSelection = await editor.getActiveTextEditorSmartSelection()
    const visibleSelection = editor.getActiveTextEditorSelectionOrVisibleContent()
    const selection = smartSelection || visibleSelection

    const editorContext = new VSCodeEditorContext(editor, selection)

    const contextMessages: ContextMessage[] = []

    const workspaceRootUri = editor.getWorkspaceRootUri()
    const isUnitTestRequest = extractTestType(command.prompt) === 'unit'

    if (contextConfig.none) {
        return []
    }
    if (contextConfig.command && contextConfig.output) {
        contextMessages.push(...editorContext.getTerminalOutputContext(contextConfig.output))
    }
    if (contextConfig.selection !== false) {
        contextMessages.push(...editorContext.getEditorSelectionContext())
    }
    if (contextConfig.currentFile && selection?.fileUri) {
        contextMessages.push(...(await editorContext.getFilePathContext(selection.fileUri)))
    }
    if (contextConfig.filePath) {
        contextMessages.push(
            ...(await editorContext.getFilePathContext(vscode.Uri.file(contextConfig.filePath)))
        )
    }
    if (contextConfig.directoryPath) {
        contextMessages.push(
            ...(await editorContext.getEditorDirContext(
                vscode.Uri.file(contextConfig.directoryPath),
                selection?.fileUri
            ))
        )
    }
    if (contextConfig.currentDir) {
        contextMessages.push(...(await editorContext.getCurrentDirContext(isUnitTestRequest)))
    }
    if (contextConfig.openTabs) {
        contextMessages.push(...(await editorContext.getEditorOpenTabsContext()))
    }
    // Additional context for unit tests requests
    if (isUnitTestRequest && contextMessages.length < 2) {
        if (selection) {
            contextMessages.push(
                ...(await editorContext.getUnitTestContextMessages(selection, workspaceRootUri))
            )
        }
    }

    return contextMessages
}
