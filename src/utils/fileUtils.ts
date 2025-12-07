import { DocumentFile } from '../../types';

export const readFileContent = (file: File): Promise<DocumentFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.type,
        content: content,
        size: file.size,
      });
    };

    reader.onerror = (error) => reject(error);

    // For this MVP, we focus on text-based formats.
    // In a production app, we would use pdf.js for PDFs, etc.
    // Here we assume the user follows the "text file" instruction.
    reader.readAsText(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const combineDocuments = (docs: DocumentFile[]): string => {
  return docs.map(doc => `
--- START DOCUMENT: ${doc.name} ---
${doc.content}
--- END DOCUMENT: ${doc.name} ---
`).join('\n');
};