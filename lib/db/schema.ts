import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Project 상태 타입
export type ProjectStatus =
  | 'uploaded'
  | 'analyzing'
  | 'direction_set'
  | 'strategy_set'
  | 'outline_ready'
  | 'generating'
  | 'completed';

export type SectionStatus = 'pending' | 'generating' | 'generated' | 'edited';

// ─── Projects ───────────────────────────────────────────────

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  status: text('status').$type<ProjectStatus>().notNull().default('uploaded'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ─── RFP Files ──────────────────────────────────────────────

export const rfpFiles = sqliteTable('rfp_files', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').$type<'pdf' | 'docx'>().notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  rawText: text('raw_text').notNull().default(''),
  uploadedAt: text('uploaded_at').notNull(),
});

// ─── RFP Analysis ───────────────────────────────────────────

export const rfpAnalyses = sqliteTable('rfp_analyses', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  overview: text('overview').notNull().default('{}'),        // JSON string
  requirements: text('requirements').notNull().default('[]'), // JSON string
  evaluationCriteria: text('evaluation_criteria').notNull().default('[]'),
  scope: text('scope').notNull().default('{}'),
  constraints: text('constraints').notNull().default('{}'),
  keywords: text('keywords').notNull().default('[]'),        // JSON string[]
  analyzedAt: text('analyzed_at').notNull(),
});

// ─── Proposal Direction ─────────────────────────────────────

export const proposalDirections = sqliteTable('proposal_directions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  candidates: text('candidates').notNull().default('[]'),    // JSON string
  selectedIndex: integer('selected_index').default(-1),
  customNotes: text('custom_notes').default(''),
  confirmedAt: text('confirmed_at'),
});

// ─── Proposal Strategy ──────────────────────────────────────

export const proposalStrategies = sqliteTable('proposal_strategies', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  competitiveStrategy: text('competitive_strategy').notNull().default(''),
  differentiators: text('differentiators').notNull().default('[]'),
  keyMessages: text('key_messages').notNull().default('[]'),
  customNotes: text('custom_notes').default(''),
  confirmedAt: text('confirmed_at'),
});

// ─── Proposal Outline ───────────────────────────────────────

export const proposalOutlines = sqliteTable('proposal_outlines', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sections: text('sections').notNull().default('[]'),        // JSON nested structure
});

// ─── Proposal Sections ──────────────────────────────────────

export const proposalSections = sqliteTable('proposal_sections', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  outlineId: text('outline_id').notNull().references(() => proposalOutlines.id),
  sectionPath: text('section_path').notNull(),               // "1.2.3" 형태
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  diagrams: text('diagrams').notNull().default('[]'),        // JSON Mermaid codes
  status: text('status').$type<SectionStatus>().notNull().default('pending'),
  generatedAt: text('generated_at'),
  editedAt: text('edited_at'),
});

// ─── Templates ──────────────────────────────────────────────

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').$type<'word' | 'ppt'>().notNull(),
  filePath: text('file_path').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  uploadedAt: text('uploaded_at').notNull(),
});

// ─── Output Files ───────────────────────────────────────────

export const outputFiles = sqliteTable('output_files', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type').$type<'word' | 'ppt'>().notNull(),
  templateId: text('template_id'),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  generatedAt: text('generated_at').notNull(),
  version: integer('version').notNull().default(1),
});
