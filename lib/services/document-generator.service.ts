import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from 'docx';
import PptxGenJS from 'pptxgenjs';
import type { OutlineSection } from '@/lib/ai/types';

// ─── 공통 타입 ──────────────────────────────────────────────

interface SectionData {
  sectionPath: string;
  title: string;
  content: string;
  diagrams: unknown[];
}

interface ProposalData {
  projectName: string;
  client: string;
  overview: string;
  competitiveStrategy: string;
  keyMessages: string[];
  outlineSections: OutlineSection[];
  sections: SectionData[];
}

// ─── Word 생성 ──────────────────────────────────────────────

// 마크다운 텍스트를 docx Paragraph 배열로 변환
function markdownToParagraphs(markdown: string): Paragraph[] {
  const lines = markdown.split('\n');
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }

    // 마크다운 헤더 (### → heading)
    if (trimmed.startsWith('### ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        }),
      );
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        }),
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      // 리스트 항목
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `• ${trimmed.slice(2)}`, size: 22 }),
          ],
          spacing: { before: 40, after: 40 },
          indent: { left: 360 },
        }),
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      // 볼드 텍스트
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed.slice(2, -2),
              bold: true,
              size: 22,
            }),
          ],
          spacing: { before: 80, after: 40 },
        }),
      );
    } else {
      // 일반 텍스트
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22 })],
          spacing: { before: 40, after: 40 },
        }),
      );
    }
  }

  return paragraphs;
}

export async function generateWordDocument(
  data: ProposalData,
): Promise<Buffer> {
  const children: Paragraph[] = [];

  // ─── 표지 ───
  children.push(
    new Paragraph({ text: '', spacing: { before: 3000 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: '기술 제안서',
          bold: true,
          size: 56,
          color: '1a1a2e',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '', spacing: { before: 400 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: data.projectName,
          bold: true,
          size: 36,
          color: '333333',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: '', spacing: { before: 400 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: `발주기관: ${data.client}`,
          size: 24,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `작성일: ${new Date().toLocaleDateString('ko-KR')}`,
          size: 24,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  );

  // ─── 목차 페이지 ───
  children.push(
    new Paragraph({
      text: '목 차',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  );

  // 목차 항목 생성
  function addOutlineEntries(
    sections: OutlineSection[],
    depth: number,
  ) {
    for (const section of sections) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title,
              size: depth === 0 ? 24 : 22,
              bold: depth === 0,
            }),
          ],
          indent: { left: depth * 360 },
          spacing: { before: depth === 0 ? 120 : 60, after: 40 },
        }),
      );
      if (section.children?.length) {
        addOutlineEntries(section.children, depth + 1);
      }
    }
  }
  addOutlineEntries(data.outlineSections, 0);

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ─── Executive Summary ───
  children.push(
    new Paragraph({
      text: 'Executive Summary',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
    }),
  );
  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.overview, size: 22 })],
      spacing: { after: 200 },
    }),
  );

  if (data.competitiveStrategy) {
    children.push(
      new Paragraph({
        text: '핵심 전략',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
    );
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: data.competitiveStrategy, size: 22 }),
        ],
        spacing: { after: 200 },
      }),
    );
  }

  if (data.keyMessages.length > 0) {
    children.push(
      new Paragraph({
        text: '핵심 메시지',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
    );
    for (const msg of data.keyMessages) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `• ${msg}`, size: 22 })],
          indent: { left: 360 },
          spacing: { before: 40, after: 40 },
        }),
      );
    }
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));

  // ─── 본문 섹션 ───
  // 섹션을 sectionPath 순서로 정렬
  const sortedSections = [...data.sections].sort((a, b) =>
    a.sectionPath.localeCompare(b.sectionPath, undefined, { numeric: true }),
  );

  for (const section of sortedSections) {
    // 섹션 제목 레벨 결정
    const depth = section.sectionPath.split('.').length;
    const headingLevel =
      depth === 1
        ? HeadingLevel.HEADING_1
        : depth === 2
          ? HeadingLevel.HEADING_2
          : HeadingLevel.HEADING_3;

    children.push(
      new Paragraph({
        text: section.title,
        heading: headingLevel,
        spacing: { before: depth === 1 ? 400 : 200, after: 100 },
      }),
    );

    // 섹션 내용
    if (section.content) {
      const contentParagraphs = markdownToParagraphs(section.content);
      children.push(...contentParagraphs);
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Malgun Gothic', size: 22 },
        },
      },
    },
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

// ─── PPT 생성 ───────────────────────────────────────────────

export async function generatePptDocument(
  data: ProposalData,
): Promise<Buffer> {
  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_WIDE'; // 16:9
  pptx.author = 'AIPROWRITER';
  pptx.title = `${data.projectName} - 기술 제안서`;

  // ─── 표지 슬라이드 ───
  const cover = pptx.addSlide();
  cover.addText('기술 제안서', {
    x: 0.5,
    y: 1.5,
    w: '90%',
    fontSize: 36,
    bold: true,
    color: '1a1a2e',
    align: 'center',
  });
  cover.addText(data.projectName, {
    x: 0.5,
    y: 2.8,
    w: '90%',
    fontSize: 24,
    color: '333333',
    align: 'center',
  });
  cover.addText(`발주기관: ${data.client}`, {
    x: 0.5,
    y: 4.0,
    w: '90%',
    fontSize: 14,
    color: '666666',
    align: 'center',
  });
  cover.addText(new Date().toLocaleDateString('ko-KR'), {
    x: 0.5,
    y: 4.5,
    w: '90%',
    fontSize: 12,
    color: '999999',
    align: 'center',
  });

  // ─── 목차 슬라이드 ───
  const tocSlide = pptx.addSlide();
  tocSlide.addText('목 차', {
    x: 0.5,
    y: 0.3,
    w: '90%',
    fontSize: 28,
    bold: true,
    color: '1a1a2e',
  });

  const tocItems: string[] = [];
  function collectTocItems(sections: OutlineSection[], depth: number) {
    for (const section of sections) {
      const indent = '  '.repeat(depth);
      tocItems.push(`${indent}${section.title}`);
      if (section.children?.length) {
        collectTocItems(section.children, depth + 1);
      }
    }
  }
  collectTocItems(data.outlineSections, 0);

  tocSlide.addText(tocItems.join('\n'), {
    x: 0.8,
    y: 1.2,
    w: '85%',
    h: 5.0,
    fontSize: 12,
    color: '333333',
    valign: 'top',
    lineSpacingMultiple: 1.5,
  });

  // ─── Executive Summary 슬라이드 ───
  const summarySlide = pptx.addSlide();
  summarySlide.addText('Executive Summary', {
    x: 0.5,
    y: 0.3,
    w: '90%',
    fontSize: 28,
    bold: true,
    color: '1a1a2e',
  });
  summarySlide.addText(data.overview.slice(0, 500), {
    x: 0.5,
    y: 1.2,
    w: '90%',
    h: 2.5,
    fontSize: 13,
    color: '333333',
    valign: 'top',
    lineSpacingMultiple: 1.4,
  });

  if (data.keyMessages.length > 0) {
    summarySlide.addText('핵심 메시지', {
      x: 0.5,
      y: 4.0,
      w: '90%',
      fontSize: 16,
      bold: true,
      color: '1a1a2e',
    });
    const msgText = data.keyMessages.map((m) => `• ${m}`).join('\n');
    summarySlide.addText(msgText, {
      x: 0.8,
      y: 4.5,
      w: '85%',
      h: 2.0,
      fontSize: 12,
      color: '333333',
      valign: 'top',
      lineSpacingMultiple: 1.4,
    });
  }

  // ─── 섹션 슬라이드 ───
  const sortedSections = [...data.sections].sort((a, b) =>
    a.sectionPath.localeCompare(b.sectionPath, undefined, { numeric: true }),
  );

  for (const section of sortedSections) {
    const slide = pptx.addSlide();

    // 섹션 제목
    slide.addText(section.title, {
      x: 0.5,
      y: 0.3,
      w: '90%',
      fontSize: 22,
      bold: true,
      color: '1a1a2e',
    });

    // 섹션 내용 (마크다운 제거 후 표시, 슬라이드 크기 제한)
    const cleanContent = section.content
      .replace(/^#{1,3}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .slice(0, 800);

    slide.addText(cleanContent, {
      x: 0.5,
      y: 1.2,
      w: '90%',
      h: 5.0,
      fontSize: 11,
      color: '333333',
      valign: 'top',
      lineSpacingMultiple: 1.3,
    });
  }

  const arrayBuffer = await pptx.write({ outputType: 'arraybuffer' }) as ArrayBuffer;
  return Buffer.from(arrayBuffer);
}
