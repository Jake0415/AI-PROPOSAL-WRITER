import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

interface ParseResult {
  text: string;
  pageCount?: number;
}

export async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  const parser = new PDFParse(buffer);
  await parser.load();
  const info = await parser.getInfo();
  const text = await parser.getText();
  parser.destroy();
  return {
    text,
    pageCount: info?.pages ?? undefined,
  };
}

export async function parseDocx(buffer: Buffer): Promise<ParseResult> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
  };
}

export async function parseRfpFile(
  buffer: Buffer,
  fileType: 'pdf' | 'docx',
): Promise<ParseResult> {
  if (fileType === 'pdf') {
    return parsePdf(buffer);
  }
  return parseDocx(buffer);
}
