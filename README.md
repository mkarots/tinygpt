# tinyrag

**Drag-and-drop your files and get your own mini GPT trained only on your data.**

How the current app works is in [docs/how-it-works.md](docs/how-it-works.md). The rest of this README still describes an earlier prototype.

## Deploy

Deploy the Next.js app on Vercel ([ADR 0001](docs/adr/0001-deploy-on-vercel.md)). Do not install Chromium.

`POST /api/crawl` fetches the page (30 second timeout), extracts `main` / `article` / content with Cheerio, converts it to markdown, then asks Gemini to strip navigation and footers. An invalid URL returns `Invalid URL format`. A timeout returns `Timed out loading the page`. Pages that only render in a browser are not executed.

Set `GEMINI_API_KEY` on the host, and allow the crawl route at least 30 seconds. JavaScript-only sites will come back thin or empty.

tinyrag lets anyone create a hosted, personal GPT chat interface built on their own text files instantly. No setup, no infrastructure, no vector DB knowledge needed.

## 🚀 How it Works

tinyrag takes a simplified, high-performance approach to Retrieval-Augmented Generation (RAG) by leveraging the massive context window of modern LLMs like **Gemini 2.5 Flash**.

Instead of setting up complex vector databases, embeddings, and retrieval pipelines, tinyrag uses **Context Stuffing**:

1.  **Upload**: You drop text files (`.txt`, `.md`, `.csv`, etc.) into the browser.
2.  **Extraction**: The app reads the content locally using the browser's native File API.
3.  **Context Injection**: The content is concatenated and injected directly into the **System Instruction** of the Gemini model.
4.  **Inference**: The model uses its 1-million-token context window to "read" your data instantly and answers questions strictly based on that context.

This makes the "training" phase nearly instantaneous (just milliseconds to upload and concatenate text) and eliminates the need for a backend database.

## ✨ Features

-   **Zero Configuration**: Drop files and start chatting.
-   **Instant "Training"**: Documents are processed in-browser.
-   **Strict Grounding**: The model is instructed to answer *only* based on provided files to minimize hallucinations.
-   **Private & Ephemeral**: Data lives in your browser session and is sent to the API only during the chat session. It is not stored in a persistent database.
-   **Streaming Responses**: Real-time typing effect for answers.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript
-   **Styling**: Tailwind CSS
-   **AI Model**: Google Gemini 2.5 Flash (via `@google/genai` SDK)
-   **Icons**: Lucide React

## 📦 Getting Started

To run this project locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/tinyrag.git
    cd tinyrag
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Key**
    Ensure you have a valid Google Gemini API key available in your environment variables (`process.env.API_KEY`).

4.  **Run the app**
    ```bash
    npm start
    ```

## 📝 Usage Guide

1.  **Open tinyrag**: Navigate to the local URL.
2.  **Drop Files**: Drag and drop up to 5 text-based files (e.g., product manuals, lecture notes, code snippets).
3.  **Chat**: Once the "Processing" indicator finishes (usually ~1 second), ask questions.
    -   *Example*: "Summarize the safety guidelines in document 1."
    -   *Example*: "What is the return policy mentioned in the text?"
4.  **Reset**: Click "New" to clear the context and start over.

## ⚠️ Limitations (MVP)

-   **File Types**: Supports text-based formats only (`.txt`, `.md`, `.json`, `.csv`, `.html`, source code). PDF parsing is not included in this minimal version.
-   **File Size**: Capped at ~5MB per file to ensure browser performance.
-   **Persistence**: Refreshing the page clears the data.
