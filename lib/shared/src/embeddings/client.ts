import type * as status from '../codebase-context/context-status'
import type { EmbeddingsSearchResults, SourcegraphGraphQLAPIClient } from '../sourcegraph-api/graphql'

import type { EmbeddingsSearch } from '.'

export class SourcegraphEmbeddingsSearchClient implements EmbeddingsSearch {
    constructor(
        private client: SourcegraphGraphQLAPIClient,
        private repoName: string,
        public readonly repoId: string,
        private codebaseLocalName = '',
        private web = false
    ) {}

    public get endpoint(): string {
        return this.client.endpoint
    }

    public async search(
        query: string,
        codeResultsCount: number,
        textResultsCount: number
    ): Promise<EmbeddingsSearchResults | Error> {
        if (this.web) {
            return this.client.searchEmbeddings([this.repoId], query, codeResultsCount, textResultsCount)
        }

        return this.client.legacySearchEmbeddings(this.repoId, query, codeResultsCount, textResultsCount)
    }

    public onDidChangeStatus(
        callback: (provider: status.ContextStatusProvider) => void
    ): status.Disposable {
        // This does not change, so there is nothing to report.
        return { dispose: () => {} }
    }

    public get status(): status.ContextGroup[] {
        return [
            {
                displayName: this.codebaseLocalName || this.repoName,
                providers: [
                    {
                        kind: 'embeddings',
                        type: 'remote',
                        state: 'ready',
                        origin: this.endpoint,
                        remoteName: this.repoName,
                    },
                ],
            },
        ]
    }
}
