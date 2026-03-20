import { pgSchema, text, integer, boolean, uuid, timestamp, jsonb, index, uniqueIndex, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type {
  StructuredRequirement,
  EvaluationCriterion,
  EvaluationItem,
  TraceabilityMapping,
  Qualification,
  StrategyPoint,
  RecommendedChapter,
  DirectionCandidate,
  Differentiator,
  OutlineSection,
  EvalItemReviewResult,
  ReqReviewResult,
  ReviewImprovement,
  LaborCostItem,
  EquipmentCostItem,
  ExpenseCostItem,
  IndirectCosts,
  PriceSummary,
  PriceCompetitiveness,
} from '@/lib/ai/types';

// bytea 커스텀 타입 (PostgreSQL 바이너리 데이터)
const bytea = customType<{ data: Buffer; driverData: string }>({
  dataType() {
    return 'bytea';
  },
  toDriver(value: Buffer): string {
    return '\\x' + value.toString('hex');
  },
  fromDriver(value: unknown): Buffer {
    if (Buffer.isBuffer(value)) return value;
    if (typeof value === 'string') {
      const hex = value.startsWith('\\x') ? value.slice(2) : value;
      return Buffer.from(hex, 'hex');
    }
    return Buffer.from(value as Buffer);
  },
});

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
  id: uuid('id').defaultRandom().primaryKey(),
  loginId: text('login_id').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull().default(''),
  phone: text('phone').notNull().default(''),
  department: text('department').notNull().default(''),
  role: text('role').$type<AppRole>().notNull().default('viewer'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Project Members (RBAC) ─────────────────────────────────

export type ProjectRole = 'owner' | 'editor' | 'viewer';

export const projectMembers = aiprowriterSchema.table('project_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').$type<ProjectRole>().notNull().default('viewer'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('project_members_project_id_idx').on(table.projectId),
  index('project_members_user_id_idx').on(table.userId),
  uniqueIndex('project_members_project_user_idx').on(table.projectId, table.userId),
]);

// ─── Projects ───────────────────────────────────────────────

export const projects = aiprowriterSchema.table('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  status: text('status').$type<ProjectStatus>().notNull().default('uploaded'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('projects_created_at_idx').on(table.createdAt),
]);

// ─── RFP Files ──────────────────────────────────────────────

export const rfpFiles = aiprowriterSchema.table('rfp_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').$type<'pdf' | 'docx'>().notNull(),
  filePath: text('file_path').notNull(),
  fileSize: integer('file_size').notNull(),
  rawText: text('raw_text').notNull().default(''),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('rfp_files_project_id_idx').on(table.projectId),
]);

// ─── RFP Analysis ───────────────────────────────────────────

export const rfpAnalyses = aiprowriterSchema.table('rfp_analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  overview: jsonb('overview').$type<{ projectName: string; client: string; budget: string; duration: string; summary: string; purpose?: string }>().notNull().default({ projectName: '', client: '', budget: '', duration: '', summary: '' }),
  requirements: jsonb('requirements').$type<StructuredRequirement[]>().notNull().default([]),
  evaluationCriteria: jsonb('evaluation_criteria').$type<EvaluationCriterion[]>().notNull().default([]),
  evaluationItems: jsonb('evaluation_items').$type<EvaluationItem[]>().notNull().default([]),
  traceabilityMatrix: jsonb('traceability_matrix').$type<TraceabilityMapping[]>().notNull().default([]),
  qualifications: jsonb('qualifications').$type<Qualification[]>().notNull().default([]),
  strategyPoints: jsonb('strategy_points').$type<StrategyPoint[]>().notNull().default([]),
  recommendedChapters: jsonb('recommended_chapters').$type<RecommendedChapter[]>().notNull().default([]),
  scope: jsonb('scope').$type<{ inScope: string[]; outOfScope: string[] }>().notNull().default({ inScope: [], outOfScope: [] }),
  constraints: jsonb('constraints').$type<{ technical: string[]; business: string[]; timeline: string[] }>().notNull().default({ technical: [], business: [], timeline: [] }),
  keywords: jsonb('keywords').$type<string[]>().notNull().default([]),
  analyzedAt: timestamp('analyzed_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('rfp_analyses_project_id_idx').on(table.projectId),
]);

// ─── Proposal Direction ─────────────────────────────────────

export const proposalDirections = aiprowriterSchema.table('proposal_directions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  candidates: jsonb('candidates').$type<DirectionCandidate[]>().notNull().default([]),
  selectedIndex: integer('selected_index').default(-1),
  customNotes: text('custom_notes').default(''),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
}, (table) => [
  index('proposal_directions_project_id_idx').on(table.projectId),
]);

// ─── Proposal Strategy ──────────────────────────────────────

export const proposalStrategies = aiprowriterSchema.table('proposal_strategies', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  competitiveStrategy: text('competitive_strategy').notNull().default(''),
  differentiators: jsonb('differentiators').$type<Differentiator[]>().notNull().default([]),
  keyMessages: jsonb('key_messages').$type<string[]>().notNull().default([]),
  writingStyle: text('writing_style').notNull().default('formal'),
  customNotes: text('custom_notes').default(''),
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
}, (table) => [
  index('proposal_strategies_project_id_idx').on(table.projectId),
]);

// ─── Proposal Outline ───────────────────────────────────────

export const proposalOutlines = aiprowriterSchema.table('proposal_outlines', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sections: jsonb('sections').$type<OutlineSection[]>().notNull().default([]),
}, (table) => [
  index('proposal_outlines_project_id_idx').on(table.projectId),
]);

// ─── Proposal Sections ──────────────────────────────────────

export const proposalSections = aiprowriterSchema.table('proposal_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  outlineId: uuid('outline_id').notNull().references(() => proposalOutlines.id),
  sectionPath: text('section_path').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  diagrams: jsonb('diagrams').$type<unknown[]>().notNull().default([]),
  status: text('status').$type<SectionStatus>().notNull().default('pending'),
  linkedReqIds: jsonb('linked_req_ids').$type<string[]>().notNull().default([]),
  generatedAt: timestamp('generated_at', { withTimezone: true }),
  editedAt: timestamp('edited_at', { withTimezone: true }),
}, (table) => [
  index('proposal_sections_project_id_idx').on(table.projectId),
  index('proposal_sections_outline_id_idx').on(table.outlineId),
]);

// ─── Review Reports ─────────────────────────────────────────

export type ReviewGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export const reviewReports = aiprowriterSchema.table('review_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  overallScore: integer('overall_score').notNull().default(0),
  totalPossible: integer('total_possible').notNull().default(100),
  grade: text('grade').$type<ReviewGrade>().notNull().default('F'),
  evalCoverage: integer('eval_coverage').notNull().default(0),
  reqCoverage: integer('req_coverage').notNull().default(0),
  formatCompliance: integer('format_compliance').notNull().default(0),
  evalResults: jsonb('eval_results').$type<EvalItemReviewResult[]>().notNull().default([]),
  reqResults: jsonb('req_results').$type<ReqReviewResult[]>().notNull().default([]),
  improvements: jsonb('improvements').$type<ReviewImprovement[]>().notNull().default([]),
  summary: text('summary').notNull().default(''),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('review_reports_project_id_idx').on(table.projectId),
]);

// ─── Price Proposals ────────────────────────────────────────

export const priceProposals = aiprowriterSchema.table('price_proposals', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  laborCosts: jsonb('labor_costs').$type<LaborCostItem[]>().notNull().default([]),
  equipmentCosts: jsonb('equipment_costs').$type<EquipmentCostItem[]>().notNull().default([]),
  expenseCosts: jsonb('expense_costs').$type<ExpenseCostItem[]>().notNull().default([]),
  indirectCosts: jsonb('indirect_costs').$type<IndirectCosts>().notNull().default({ generalAdmin: 0, generalAdminRate: 0, profit: 0, profitRate: 0 }),
  summary: jsonb('summary').$type<PriceSummary>().notNull().default({ directLabor: 0, directExpense: 0, miscExpense: 0, directSubtotal: 0, generalAdmin: 0, profit: 0, indirectSubtotal: 0, supplyPrice: 0, vat: 0, totalPrice: 0 }),
  competitiveness: jsonb('competitiveness').$type<PriceCompetitiveness>().notNull().default({ budgetRatio: 0, recommendedRange: '', strategy: '' }),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('price_proposals_project_id_idx').on(table.projectId),
]);

// ─── Proposal Versions (버전 관리) ──────────────────────────

export const proposalVersions = aiprowriterSchema.table('proposal_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  label: text('label').notNull(),
  snapshot: jsonb('snapshot').$type<Record<string, unknown>>().notNull(),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('proposal_versions_project_id_idx').on(table.projectId),
]);

// ─── Templates ──────────────────────────────────────────────

export const templates = aiprowriterSchema.table('templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  type: text('type').$type<'word' | 'ppt'>().notNull(),
  filePath: text('file_path').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── AI Settings ────────────────────────────────────────────

export type AiProviderType = 'claude' | 'gpt';

export const aiSettings = aiprowriterSchema.table('ai_settings', {
  id: text('id').primaryKey(), // 고정 키 'default' 사용
  provider: text('provider').$type<AiProviderType>().notNull().default('claude'),
  claudeModel: text('claude_model').notNull().default('claude-sonnet-4-6'),
  gptModel: text('gpt_model').notNull().default('gpt-4o'),
  claudeApiKey: text('claude_api_key'), // AES-256-GCM 암호화 저장
  gptApiKey: text('gpt_api_key'),       // AES-256-GCM 암호화 저장
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Tenant Settings (회사별 커스터마이징) ──────────────────

export const tenantSettings = aiprowriterSchema.table('tenant_settings', {
  id: text('id').primaryKey(), // 고정 키 'default' 사용
  appName: text('app_name').notNull().default('AIPROWRITER'),
  logoUrl: text('logo_url').notNull().default(''),
  primaryColor: text('primary_color').notNull().default(''),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Output Files ───────────────────────────────────────────

export const outputFiles = aiprowriterSchema.table('output_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type: text('type').$type<'word' | 'ppt'>().notNull(),
  templateId: uuid('template_id'),
  filePath: text('file_path').notNull(),
  fileName: text('file_name').notNull(),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  version: integer('version').notNull().default(1),
}, (table) => [
  index('output_files_project_id_idx').on(table.projectId),
]);

// ─── Audit Logs (감사 로그) ──────────────────────────────────

export type AuditAction =
  | 'login' | 'logout'
  | 'project.create' | 'project.update' | 'project.delete'
  | 'rfp.upload' | 'rfp.analyze'
  | 'direction.generate' | 'direction.select'
  | 'strategy.generate'
  | 'outline.generate' | 'outline.update'
  | 'section.generate' | 'section.update'
  | 'review.generate'
  | 'price.generate'
  | 'output.download'
  | 'template.upload' | 'template.delete'
  | 'user.create' | 'user.update' | 'user.delete'
  | 'settings.update'
  | 'prompt.create' | 'prompt.update' | 'prompt.revert';

export type AuditResourceType =
  | 'auth' | 'project' | 'rfp' | 'direction' | 'strategy'
  | 'outline' | 'section' | 'review' | 'price' | 'output'
  | 'template' | 'user' | 'settings' | 'prompt';

export const auditLogs = aiprowriterSchema.table('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  action: text('action').$type<AuditAction>().notNull(),
  resourceType: text('resource_type').$type<AuditResourceType>().notNull(),
  resourceId: text('resource_id'),
  details: jsonb('details').$type<Record<string, unknown>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('audit_logs_user_id_idx').on(table.userId),
  index('audit_logs_action_idx').on(table.action),
  index('audit_logs_created_at_idx').on(table.createdAt),
]);

// ─── Analysis Steps (단계별 RFP 분석) ───────────────────────

export type AnalysisStepStatus = 'pending' | 'running' | 'completed' | 'failed';

export const analysisSteps = aiprowriterSchema.table('analysis_steps', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number').notNull(),
  slug: text('slug').notNull(),
  status: text('status').$type<AnalysisStepStatus>().notNull().default('pending'),
  result: jsonb('result').$type<Record<string, unknown> | null>(),
  promptUsed: text('prompt_used'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('analysis_steps_project_id_idx').on(table.projectId),
  index('analysis_steps_project_step_idx').on(table.projectId, table.stepNumber),
]);

// ─── Conversations (대화형 AI 코칭) ─────────────────────────

export type ConversationTopic =
  | 'rfp-analysis' | 'direction-coaching' | 'strategy-coaching'
  | 'outline-coaching' | 'section-editing' | 'review-coaching'
  | 'price-coaching' | 'general';

export const conversations = aiprowriterSchema.table('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  topic: text('topic').$type<ConversationTopic>().notNull(),
  stageContext: jsonb('stage_context').$type<Record<string, unknown>>().notNull().default({}),
  status: text('status').$type<'active' | 'archived'>().notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('conversations_project_id_idx').on(table.projectId),
  index('conversations_user_id_idx').on(table.userId),
  index('conversations_status_idx').on(table.status),
]);

export const messages = aiprowriterSchema.table('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  role: text('role').$type<'user' | 'assistant' | 'system'>().notNull(),
  content: text('content').notNull(),
  toolCalls: jsonb('tool_calls').$type<Record<string, unknown> | null>(),
  tokenUsage: jsonb('token_usage').$type<{ prompt: number; completion: number } | null>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('messages_conversation_id_idx').on(table.conversationId),
]);

export const llmCallLogs = aiprowriterSchema.table('llm_call_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  conversationId: uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  service: text('service').notNull(),
  provider: text('provider').$type<'claude' | 'gpt'>().notNull(),
  model: text('model').notNull(),
  promptTokens: integer('prompt_tokens').notNull().default(0),
  completionTokens: integer('completion_tokens').notNull().default(0),
  totalCost: text('total_cost').notNull().default('0'),
  latencyMs: integer('latency_ms').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('llm_call_logs_project_id_idx').on(table.projectId),
  index('llm_call_logs_created_at_idx').on(table.createdAt),
  index('llm_call_logs_provider_idx').on(table.provider),
]);

// ─── Prompt Templates (프롬프트 관리) ────────────────────────

export type PromptCategory = 'analysis' | 'generation' | 'review' | 'coaching' | 'price';

export const promptTemplates = aiprowriterSchema.table('prompt_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  category: text('category').$type<PromptCategory>().notNull(),
  systemPrompt: text('system_prompt').notNull(),
  userPromptTemplate: text('user_prompt_template').notNull(),
  maxTokens: integer('max_tokens').notNull().default(4096),
  version: integer('version').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('prompt_templates_slug_idx').on(table.slug),
  index('prompt_templates_category_idx').on(table.category),
]);

export const promptTemplateVersions = aiprowriterSchema.table('prompt_template_versions', {
  id: uuid('id').defaultRandom().primaryKey(),
  templateId: uuid('template_id').notNull().references(() => promptTemplates.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  userPromptTemplate: text('user_prompt_template').notNull(),
  maxTokens: integer('max_tokens').notNull(),
  changedBy: uuid('changed_by').references(() => profiles.id, { onDelete: 'set null' }),
  changeNote: text('change_note').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('prompt_versions_template_id_idx').on(table.templateId),
]);

// ─── Relations ──────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ many }) => ({
  projectMembers: many(projectMembers),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  members: many(projectMembers),
  rfpFiles: many(rfpFiles),
  rfpAnalyses: many(rfpAnalyses),
  directions: many(proposalDirections),
  strategies: many(proposalStrategies),
  outlines: many(proposalOutlines),
  sections: many(proposalSections),
  reviewReports: many(reviewReports),
  priceProposals: many(priceProposals),
  outputFiles: many(outputFiles),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  user: one(profiles, { fields: [projectMembers.userId], references: [profiles.id] }),
}));

export const rfpFilesRelations = relations(rfpFiles, ({ one }) => ({
  project: one(projects, { fields: [rfpFiles.projectId], references: [projects.id] }),
}));

export const rfpAnalysesRelations = relations(rfpAnalyses, ({ one }) => ({
  project: one(projects, { fields: [rfpAnalyses.projectId], references: [projects.id] }),
}));

export const proposalDirectionsRelations = relations(proposalDirections, ({ one }) => ({
  project: one(projects, { fields: [proposalDirections.projectId], references: [projects.id] }),
}));

export const proposalStrategiesRelations = relations(proposalStrategies, ({ one }) => ({
  project: one(projects, { fields: [proposalStrategies.projectId], references: [projects.id] }),
}));

export const proposalOutlinesRelations = relations(proposalOutlines, ({ one, many }) => ({
  project: one(projects, { fields: [proposalOutlines.projectId], references: [projects.id] }),
  sections: many(proposalSections),
}));

export const proposalSectionsRelations = relations(proposalSections, ({ one }) => ({
  project: one(projects, { fields: [proposalSections.projectId], references: [projects.id] }),
  outline: one(proposalOutlines, { fields: [proposalSections.outlineId], references: [proposalOutlines.id] }),
}));

export const reviewReportsRelations = relations(reviewReports, ({ one }) => ({
  project: one(projects, { fields: [reviewReports.projectId], references: [projects.id] }),
}));

export const priceProposalsRelations = relations(priceProposals, ({ one }) => ({
  project: one(projects, { fields: [priceProposals.projectId], references: [projects.id] }),
}));

export const outputFilesRelations = relations(outputFiles, ({ one }) => ({
  project: one(projects, { fields: [outputFiles.projectId], references: [projects.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(profiles, { fields: [auditLogs.userId], references: [profiles.id] }),
}));

export const analysisStepsRelations = relations(analysisSteps, ({ one }) => ({
  project: one(projects, { fields: [analysisSteps.projectId], references: [projects.id] }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  project: one(projects, { fields: [conversations.projectId], references: [projects.id] }),
  user: one(profiles, { fields: [conversations.userId], references: [profiles.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const llmCallLogsRelations = relations(llmCallLogs, ({ one }) => ({
  project: one(projects, { fields: [llmCallLogs.projectId], references: [projects.id] }),
  conversation: one(conversations, { fields: [llmCallLogs.conversationId], references: [conversations.id] }),
}));

export const promptTemplatesRelations = relations(promptTemplates, ({ many }) => ({
  versions: many(promptTemplateVersions),
}));

export const promptTemplateVersionsRelations = relations(promptTemplateVersions, ({ one }) => ({
  template: one(promptTemplates, { fields: [promptTemplateVersions.templateId], references: [promptTemplates.id] }),
  changedByUser: one(profiles, { fields: [promptTemplateVersions.changedBy], references: [profiles.id] }),
}));
