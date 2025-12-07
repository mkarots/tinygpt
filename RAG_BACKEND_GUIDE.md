# Building a "Proper but Tiny" RAG Backend

Currently, **tinyrag** uses **Context Stuffing**: we simply paste all document text into the prompt because Gemini 2.5 Flash has a massive 1M token context window. This is perfect for an MVP.

However, if you want to scale beyond ~50 files, persist data between sessions, or reduce token costs, you need a **Backend RAG** (Retrieval-Augmented Generation) system.

This guide outlines how to build a production-grade RAG backend that adheres to the **"Tiny"** philosophy: simple, serverless-friendly, and easy to maintain.

---

## 1. The Architecture

The goal is to move the heavy lifting from the Browser to a Node.js server.

**The "Tiny" RAG Stack:**
*   **Runtime**: Node.js (Express or Next.js API Routes).
*   **LLM & Embeddings**: Google Gemini API.
*   **Vector Database**: **LanceDB** (Embedded) or **ChromaDB**.
    *   *Why?* Unlike Pinecone or Weaviate, these run *inside* your application or as a simple local file. No external infrastructure to manage.

---

## 2. Ingestion Pipeline (The "Write" Path)

When a user uploads a file, we shouldn't just store the text. We need to prepare it for semantic search.

### Step A: Chunking
LLMs struggle to find specific needles in massive haystacks, and embedding models have token limits (usually 2048 or 8192 tokens). We must split text into smaller chunks.

*   **Strategy**: Recursive Character Splitting.
*   **Chunk Size**: 1000 characters.
*   **Overlap**: 200 characters (ensures context isn't lost at cut-points).

```typescript
// utils/chunker.ts
export function chunkText(text: string, size = 1000, overlap = 200): string[] {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    // Move forward, but back up by overlap amount
    start += (size - overlap);
  }
  return chunks;
}
```

### Step B: Embedding
Convert text chunks into vector arrays (lists of numbers representing meaning) using Gemini.

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function getEmbeddings(chunks: string[]) {
  // Batch embedding is more efficient
  const result = await ai.models.batchEmbedContents({
    model: "text-embedding-004",
    requests: chunks.map(text => ({
      content: { parts: [{ text }] }
    }))
  });
  
  return result.embeddings.map(e => e.values); // Returns number[][]
}
```

### Step C: Storage (LanceDB Example)
LanceDB stores vectors in a local file structure. It is incredibly fast and requires no running server process (it runs in-process).

```typescript
import lancedb from "vectordb";

async function storeVectors(docId: string, chunks: string[], vectors: number[][]) {
  const db = await lancedb.connect("data/tinyrag-store");
  const table = await db.createTable("documents", 
    chunks.map((text, i) => ({
      id: `${docId}-${i}`,
      vector: vectors[i],
      text: text,
      docId: docId
    })), 
    { writeMode: "append" }
  );
}
```

---

## 3. Retrieval Pipeline (The "Read" Path)

When the user asks a question, we don't send *all* documents. We only send the relevant parts.

### Step A: Embed Query
Convert the user's question into the same vector space as the documents.

```typescript
const queryVector = await ai.models.embedContent({
  model: "text-embedding-004",
  content: { parts: [{ text: userQuestion }] }
});
```

### Step B: Vector Search
Find the top 5-10 chunks that are mathematically closest to the question.

```typescript
const db = await lancedb.connect("data/tinyrag-store");
const table = await db.openTable("documents");

const results = await table.search(queryVector.embedding.values)
  .limit(5)
  .execute();

// Extract just the text
const context = results.map(r => r.text).join("\n\n");
```

### Step C: Generation
Send the *relevant* context to Gemini 2.5 Flash.

```typescript
const systemInstruction = `
You are TinyGPT. Answer the user question based ONLY on the following context:
${context}
`;

const chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: { systemInstruction }
});

const response = await chat.sendMessage({ message: userQuestion });
```

---

## 4. Comparison: Frontend vs. Backend RAG

| Feature | Current (Frontend / Context Stuffing) | Backend RAG (Vector Search) |
| :--- | :--- | :--- |
| **Setup** | Zero (Browser only) | Moderate (Node server + DB) |
| **Cost** | High (Input tokens per query) | Low (Only relevant chunks sent) |
| **Speed** | Fast (for < 20 files) | Fast (Scales to 1000s of files) |
| **Memory** | Limited by Browser RAM | Limited by Disk Space |
| **Privacy** | Ephemeral (Lost on refresh) | Persistent (Saved in DB) |

## 5. Deployment Strategy

To keep this "Tiny", deploy the backend as follows:

1.  **Vercel / Next.js**: 
    *   Use `PgVector` (Supabase) instead of LanceDB if deploying to serverless environments (like Vercel functions), as file-system access is ephemeral there.
2.  **Docker / Railway / Render**:
    *   You can use **LanceDB** here easily because you have a persistent file system.
    *   This is the most "all-in-one" solution.

## 6. Summary

To upgrade tinyrag:
1.  Spin up a simple Express.js server.
2.  Add an endpoint `/upload` that chunks text and saves vectors to a local LanceDB folder.
3.  Add an endpoint `/chat` that searches LanceDB and calls Gemini.
4.  Update the frontend `geminiService.ts` to call your API instead of the Gemini SDK directly.
