export interface RfpChunk {
  index: number;
  title: string;
  content: string;
}

const CHAPTER_PATTERNS = [
  /^(제\s*\d+\s*장)\s+(.+)/m,
  /^(Ⅰ|Ⅱ|Ⅲ|Ⅳ|Ⅴ|Ⅵ|Ⅶ|Ⅷ|Ⅸ|Ⅹ)\.\s*(.+)/m,
  /^(\d+)\.\s+(.{2,})/m,
];

export function chunkRfpText(rawText: string, maxChunkSize = 30000): RfpChunk[] {
  // 장/절 패턴으로 분리 시도
  const sections = splitByChapterPatterns(rawText);
  if (sections.length > 1) {
    return mergeSmallChunks(sections, maxChunkSize);
  }

  // 패턴 없으면 크기 기반 분할
  return splitBySize(rawText, maxChunkSize);
}

function splitByChapterPatterns(text: string): RfpChunk[] {
  const lines = text.split('\n');
  const chunks: RfpChunk[] = [];
  let currentTitle = '서문';
  let currentContent: string[] = [];
  let index = 0;

  for (const line of lines) {
    let matched = false;
    for (const pattern of CHAPTER_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        if (currentContent.length > 0) {
          chunks.push({ index: index++, title: currentTitle, content: currentContent.join('\n') });
        }
        currentTitle = match[0].trim();
        currentContent = [];
        matched = true;
        break;
      }
    }
    if (!matched) {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    chunks.push({ index: index++, title: currentTitle, content: currentContent.join('\n') });
  }

  return chunks;
}

function mergeSmallChunks(chunks: RfpChunk[], maxSize: number): RfpChunk[] {
  const merged: RfpChunk[] = [];
  let current: RfpChunk | null = null;

  for (const chunk of chunks) {
    if (!current) {
      current = { ...chunk };
      continue;
    }

    if (current.content.length + chunk.content.length < maxSize) {
      current.content += '\n\n' + chunk.content;
      current.title += ' + ' + chunk.title;
    } else {
      merged.push(current);
      current = { ...chunk, index: merged.length };
    }
  }

  if (current) merged.push(current);
  return merged;
}

function splitBySize(text: string, maxSize: number): RfpChunk[] {
  const chunks: RfpChunk[] = [];
  const paragraphs = text.split(/\n\s*\n/);
  let current = '';
  let index = 0;

  for (const para of paragraphs) {
    if (current.length + para.length > maxSize && current.length > 0) {
      chunks.push({ index: index++, title: `파트 ${index}`, content: current.trim() });
      current = '';
    }
    current += para + '\n\n';
  }

  if (current.trim()) {
    chunks.push({ index: index, title: `파트 ${index + 1}`, content: current.trim() });
  }

  return chunks;
}
