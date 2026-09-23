import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  GeminiEmbeddingService,
  embeddingValuesList,
  firstEmbeddingValues,
} from './GeminiEmbeddingService';

describe('firstEmbeddingValues', () => {
  it('returns the first embedding vector', () => {
    assert.deepEqual(
      firstEmbeddingValues({ embeddings: [{ values: [0.1, 0.2] }] }),
      [0.1, 0.2]
    );
  });

  it('throws when embeddings are missing', () => {
    assert.throws(() => firstEmbeddingValues({}), /Failed to generate embedding/);
    assert.throws(() => firstEmbeddingValues({ embeddings: [{}] }), /Failed to generate embedding/);
  });
});

describe('embeddingValuesList', () => {
  it('returns every vector in request order', () => {
    assert.deepEqual(
      embeddingValuesList(
        { embeddings: [{ values: [1] }, { values: [2, 3] }] },
        2
      ),
      [[1], [2, 3]]
    );
  });

  it('throws when the batch size does not match', () => {
    assert.throws(
      () => embeddingValuesList({ embeddings: [{ values: [1] }] }, 2),
      /Failed to generate embedding/
    );
  });
});

describe('GeminiEmbeddingService', () => {
  it('embeds one text with contents, not content', async () => {
    const calls: unknown[] = [];
    const service = new GeminiEmbeddingService('key', async (params) => {
      calls.push(params);
      return { embeddings: [{ values: [0.5] }] };
    });

    assert.deepEqual(await service.embedText('hello'), [0.5]);
    assert.deepEqual(calls[0], {
      model: 'text-embedding-004',
      contents: 'hello',
    });
  });

  it('embeds a batch in one request', async () => {
    const service = new GeminiEmbeddingService('key', async (params) => {
      const texts = params.contents as string[];
      return { embeddings: texts.map((_, i) => ({ values: [i] })) };
    });

    assert.deepEqual(await service.embedBatch(['a', 'b']), [[0], [1]]);
    assert.deepEqual(await service.embedBatch([]), []);
  });

  it('rejects a missing API key', () => {
    assert.throws(() => new GeminiEmbeddingService(''), /API Key is missing/);
  });
});
