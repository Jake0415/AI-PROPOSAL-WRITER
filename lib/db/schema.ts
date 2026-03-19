import { pgSchema, text, integer, boolean } from 'drizzle-orm/pg-core';

// aiprowriter 전용 스키마 (다른 프로젝트와 분리)
export const aiprowriterSchema = pgSchema('aiprowriter');

// Project 상태 타입
export type ProjectStatus =
  | 'uploaded'
  | 'analyzing'
  | 'direction_set'
  | 'strategy_set'
  | 'outline_ready'
  | 'generating'
  | 'sections_ready'
  | 'reviewing'
  | 'completed';

export type SectionStatus = 'pending' | 'generating' | 'generated' | 'edited';

// ─── Profiles ────────────────────────────────────────────────

export type AppRole = 'super_admin' | 'admin' | 'proposal_pm' | 'tech_writer' | 'viewer';

export const profiles = aiprowriterSchema.table('profiles', {
  id: text('id').primaryKey(),
  loginId: text('login_id').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull().default(''),
  phone: text('phone').notNull().default(''),
  department: text('department').notNull().default(''),
  role: text('role').$type<AppRole>().notNull().default('viewer'),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ─── Project Members (RBAC) ─────────────────────────────────

export type ProjectRole = 'owner' | 'editor' | 'viewer';

export const projectMembers = aiprowriterSchema.table('project_members', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').$type<ProjectRole>().notNull().default('viewer'),
  createdAt: text('created_at').notNull(),
});

// ─── Projects ───────────────────────────────────────────────

export const projects = aiprowriterSchema.table('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  status: text('status').$type<ProjectStatus>().notNull().default('uploaded'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ─── RFP Files ──────────────────────────────────────────────

export const rfpFiles = aiprowriterSchema.table('rfp_files', {
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

export const rfpAnalyses = aiprowriterSchema.table('rfp_analyses', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  overview: text('overview').notNull().default('{}'),
  requirements: text('requirements').notNull().default('[]'),
  evaluationCriteria: text('evaluation_criteria').notNull().default('[]'),
  // 수주 최적화 분석 확장 필드
  evaluationItems: text('evaluation_items').notNull().default('[]'),         // EvaluationItem[] (EVAL-ID 체계)
  traceabilityMatrix: text('traceability_matrix').notNull().default('[]'),   // TraceabilityMapping[]
  qualifications: text('qualifications').notNull().default('[]'),            // Qualification[]
  strategyPoints: text('strategy_points').notNull().default('[]'),           // StrategyPoint[]
  recommendedChapters: text('recommended_chapters').notNull().default('[]'), // RecommendedChapter[]
  scope: text('scope').notNull().default('{}'),
  constraints: text('constraints').notNull().default('{}'),
  keywords: text('keywords').notNull().default('[]'),
  analyzedAt: text('analyzed_at').notNull(),
});

// ─── Proposal Direction ─────────────────────────────────────

export const proposalDirections = aiprowriterSchema.table('proposal_directions', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  candidates: text('candidates').notNull().default('[]'),
  selectedIndex: integer('selected_index').default(-1),
  customNotes: text('custom_notes').default(''),
  confirmedAt: text('confirmed_at'),
});

// ─── Proposal Strategy ──────────────────────────────────────

export const proposalStrategies = aiprowriterSchema.table('proposal_strategies', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  competitiveStrategy: text('competitive_strategy').notNull().default(''),
  differentiators: text('differentiators').notNull().default('[]'),
  keyMessages: text('key_messages').notNull().default('[]'),
  writingStyle: text('writing_style').notNull().default('formal'), // formal|descriptive|concise|persuasive
  customNotes: text('custom_notes').default(''),
  confirmedAt: text('confirmed_at'),
});

// ─── Proposal Outline ───────────────────────────────────────

export const proposalOutlines = aiprowriterSchema.table('proposal_outlines', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sections: text('sections').notNull().default('[]'),
});

// ─── Proposal Sections ──────────────────────────────────────

export const proposalSections = aiprowriterSchema.table('proposal_sections', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  outlineId: text('outline_id').notNull().references(() => proposalOutlines.id),
  sectionPath: text('section_path').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  diagrams: text('diagrams').notNull().default('[]'),
  status: text('status').$type<SectionStatus>().notNull().default('pending'),
  linkedReqIds: text('linked_req_ids').notNull().default('[]'), // REQ-ID 배열 (추적성)
  generatedAt: text('generated_at'),
  editedAt: text('edited_at'),
});

// ─── Review Reports ─────────────────────────────────────────

export type ReviewGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export const reviewReports = aiprowriterSchema.table('review_reports', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  overallScore: integer('overall_score').notNull().default(0),
  totalPossible: integer('total_possible').notNull().default(100),
  grade: text('grade').$type<ReviewGrade>().notNull().default('F'),
  evalCoverage: integer('eval_coverage').notNull().default(0),         // 평가항목 충족률 %
  reqCoverage: integer('req_coverage').notNull().default(0),           // 요구사항 충족률 %
  formatCompliance: integer('format_compliance').notNull().default(0), // 형식 준수율 %
  evalResults: text('eval_results').notNull().default('[]'),           // EvalItemReviewResult[]
  reqResults: text('req_results').notNull().default('[]'),             // ReqReviewResult[]
  improvements: text('improvements').notNull().default('[]'),          // ReviewImprovement[]
  summary: text('summary').notNull().default(''),
  generatedAt: text('generated_at').notNull(),
});

// ─── Price Proposals ────────────────────────────────────────

export const priceProposals = aiprowriterSchema.table('price_proposals', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  laborCosts: text('labor_costs').notNull().default('[]'),       // LaborCostItem[]
  equipmentCosts: text('equipment_costs').notNull().default('[]'), // EquipmentCostItem[]
  expenseCosts: text('expense_costs').notNull().default('[]'),    // ExpenseCostItem[]
  indirectCosts: text('indirect_costs').notNull().default('{}'),  // IndirectCosts
  summary: text('summary').notNull().default('{}'),               // PriceSummary
  competitiveness: text('competitiveness').notNull().default('{}'), // PriceCompetitiveness
  generatedAt: text('generated_at').notNull(),
});

// ─── Templates ──────────────────────────────────────────────

export const templates = aiprowriterSchema.table('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').$type<'word' | 'ppt'>().notNull(),
  filePath: text('file_path').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  uploadedAt: text('uploaded_at').notNull(),
});

// ─── AI Settings ────────────────────────────────────────────

export type AiProviderType = 'claude' | 'gpt';

export const aiSettings = aiprowriterSchema.table('ai_settings', {
  id: text('id').primaryKey(),
  provider: text('provider').$type<AiProviderType>().notNull().default('claude'),
  claudeModel: text('claude_model').notNull().default('claude-sonnet-4-6'),
  gptModel: text('gpt_model').notNull().default('gpt-4o'),
  updatedAt: text('updated_at').notNull(),
});

// ─── Output Files ───────────────────────────────────────────

export const outputFiles = aiprowriterSchema.table('output_files', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type').$type<'word' | 'ppt'>().notNull(),
  templateId: text('template_id'),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  generatedAt: text('generated_at').notNull(),
  version: integer('version').notNull().default(1),
});
