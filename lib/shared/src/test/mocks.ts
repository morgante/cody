import type { URI } from 'vscode-uri'

import type {
    ActiveTextEditor,
    ActiveTextEditorDiagnostic,
    ActiveTextEditorSelection,
    ActiveTextEditorSelectionRange,
    ActiveTextEditorVisibleContent,
    Editor,
} from '../editor'
import type { EmbeddingsSearch } from '../embeddings'
import type { IntentClassificationOption, IntentDetector } from '../intent-detector'
import type { EmbeddingsSearchResults } from '../sourcegraph-api/graphql'

export class MockEmbeddingsClient implements EmbeddingsSearch {
    public readonly repoId = 'test-repo-id'

    constructor(private mocks: Partial<EmbeddingsSearch> = {}) {}

    public get endpoint(): string {
        return this.mocks.endpoint || 'https://host.example:3000'
    }

    public search(
        query: string,
        codeResultsCount: number,
        textResultsCount: number
    ): Promise<EmbeddingsSearchResults | Error> {
        return (
            this.mocks.search?.(query, codeResultsCount, textResultsCount) ??
            Promise.resolve({ codeResults: [], textResults: [] })
        )
    }

    public onDidChangeStatus(): { dispose: () => void } {
        return { dispose() {} }
    }

    public get status(): never[] {
        return []
    }
}

export class MockIntentDetector implements IntentDetector {
    constructor(private mocks: Partial<IntentDetector> = {}) {}

    public isEditorContextRequired(input: string): boolean | Error {
        return this.mocks.isEditorContextRequired?.(input) ?? false
    }

    public classifyIntentFromOptions<Intent extends string>(
        input: string,
        options: IntentClassificationOption<Intent>[],
        fallback: Intent
    ): Promise<Intent> {
        return Promise.resolve(fallback)
    }
}

export class MockEditor implements Editor {
    constructor(private mocks: Partial<Editor> = {}) {}

    public getWorkspaceRootUri(): URI | null {
        return this.mocks.getWorkspaceRootUri?.() ?? null
    }

    public getActiveTextEditorSelection(): ActiveTextEditorSelection | null {
        return this.mocks.getActiveTextEditorSelection?.() ?? null
    }

    public getActiveTextEditorSmartSelection(): Promise<ActiveTextEditorSelection | null> {
        return this.mocks.getActiveTextEditorSmartSelection?.() ?? Promise.resolve(null)
    }

    public getActiveTextEditorSelectionOrEntireFile(): ActiveTextEditorSelection | null {
        return this.mocks.getActiveTextEditorSelection?.() ?? null
    }

    public getActiveTextEditorSelectionOrVisibleContent(): ActiveTextEditorSelection | null {
        return this.mocks.getActiveTextEditorSelection?.() ?? null
    }

    public getActiveTextEditorDiagnosticsForRange(
        range: ActiveTextEditorSelectionRange
    ): ActiveTextEditorDiagnostic[] | null {
        return this.mocks.getActiveTextEditorDiagnosticsForRange?.(range) ?? null
    }

    public getActiveTextEditor(): ActiveTextEditor | null {
        return this.mocks.getActiveTextEditor?.() ?? null
    }

    public getActiveTextEditorVisibleContent(): ActiveTextEditorVisibleContent | null {
        return this.mocks.getActiveTextEditorVisibleContent?.() ?? null
    }

    public showWarningMessage(message: string): Promise<void> {
        return this.mocks.showWarningMessage?.(message) ?? Promise.resolve()
    }

    public async getTextEditorContentForFile(
        uri: URI,
        range?: ActiveTextEditorSelectionRange
    ): Promise<string | undefined> {
        return this.mocks.getTextEditorContentForFile?.(uri, range) ?? Promise.resolve(undefined)
    }
}

export const defaultEmbeddingsClient = new MockEmbeddingsClient()

export const defaultIntentDetector = new MockIntentDetector()

export const defaultEditor = new MockEditor()
