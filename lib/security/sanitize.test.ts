import { describe, it, expect } from 'vitest';
import {
  sanitizeFileName,
  isAllowedMimeType,
  isAllowedFileSize,
  validateMagicBytes,
  escapeHtml,
} from './sanitize';

describe('sanitizeFileName', () => {
  it('특수 문자를 제거한다', () => {
    expect(sanitizeFileName('test<file>.pdf')).toBe('test_file_.pdf');
  });

  it('경로 조작을 방지한다', () => {
    const result1 = sanitizeFileName('../../etc/passwd');
    expect(result1).not.toContain('..');
    expect(result1).not.toContain('/');

    const result2 = sanitizeFileName('..\\..\\windows');
    expect(result2).not.toContain('..');
    expect(result2).not.toContain('\\');
  });

  it('255자로 제한한다', () => {
    const longName = 'a'.repeat(300) + '.pdf';
    expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255);
  });

  it('빈 문자열을 처리한다', () => {
    expect(sanitizeFileName('')).toBe('');
  });
});

describe('isAllowedMimeType', () => {
  it('PDF를 허용한다', () => {
    expect(isAllowedMimeType('application/pdf', ['pdf'])).toBe(true);
  });

  it('DOCX를 허용한다', () => {
    expect(isAllowedMimeType(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ['docx'],
    )).toBe(true);
  });

  it('허용되지 않은 타입을 거부한다', () => {
    expect(isAllowedMimeType('text/html', ['pdf', 'docx'])).toBe(false);
    expect(isAllowedMimeType('application/javascript', ['pdf'])).toBe(false);
  });
});

describe('isAllowedFileSize', () => {
  it('허용 범위 내 크기를 통과시킨다', () => {
    expect(isAllowedFileSize(1024)).toBe(true);
    expect(isAllowedFileSize(50 * 1024 * 1024)).toBe(true);
  });

  it('0 또는 초과 크기를 거부한다', () => {
    expect(isAllowedFileSize(0)).toBe(false);
    expect(isAllowedFileSize(51 * 1024 * 1024)).toBe(false);
  });
});

describe('validateMagicBytes', () => {
  it('PDF 시그니처를 검증한다', () => {
    const pdfBuffer = Buffer.from('%PDF-1.4', 'ascii');
    expect(validateMagicBytes(pdfBuffer, 'pdf')).toBe(true);
  });

  it('DOCX/ZIP 시그니처를 검증한다', () => {
    const zipBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00]);
    expect(validateMagicBytes(zipBuffer, 'docx')).toBe(true);
  });

  it('잘못된 시그니처를 거부한다', () => {
    const fakeBuffer = Buffer.from('not a pdf');
    expect(validateMagicBytes(fakeBuffer, 'pdf')).toBe(false);
  });
});

describe('escapeHtml', () => {
  it('HTML 특수 문자를 이스케이프한다', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });
});
