CREATE SCHEMA "aiprowriter";
--> statement-breakpoint
CREATE TABLE "aiprowriter"."ai_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'claude' NOT NULL,
	"claude_model" text DEFAULT 'claude-sonnet-4-6' NOT NULL,
	"gpt_model" text DEFAULT 'gpt-4o' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" text,
	"details" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."output_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"type" text NOT NULL,
	"template_id" uuid,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."price_proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"labor_costs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"equipment_costs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expense_costs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"indirect_costs" jsonb DEFAULT '{"generalAdmin":0,"generalAdminRate":0,"profit":0,"profitRate":0}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{"directLabor":0,"directExpense":0,"miscExpense":0,"directSubtotal":0,"generalAdmin":0,"profit":0,"indirectSubtotal":0,"supplyPrice":0,"vat":0,"totalPrice":0}'::jsonb NOT NULL,
	"competitiveness" jsonb DEFAULT '{"budgetRatio":0,"recommendedRange":"","strategy":""}'::jsonb NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"login_id" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"department" text DEFAULT '' NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_login_id_unique" UNIQUE("login_id")
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."prompt_template_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"system_prompt" text NOT NULL,
	"user_prompt_template" text NOT NULL,
	"max_tokens" integer NOT NULL,
	"changed_by" uuid,
	"change_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text NOT NULL,
	"system_prompt" text NOT NULL,
	"user_prompt_template" text NOT NULL,
	"max_tokens" integer DEFAULT 4096 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."proposal_directions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"candidates" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"selected_index" integer DEFAULT -1,
	"custom_notes" text DEFAULT '',
	"confirmed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."proposal_outlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."proposal_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"outline_id" uuid NOT NULL,
	"section_path" text NOT NULL,
	"title" text NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"diagrams" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"linked_req_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"generated_at" timestamp with time zone,
	"edited_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."proposal_strategies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"competitive_strategy" text DEFAULT '' NOT NULL,
	"differentiators" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"key_messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"writing_style" text DEFAULT 'formal' NOT NULL,
	"custom_notes" text DEFAULT '',
	"confirmed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."review_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"overall_score" integer DEFAULT 0 NOT NULL,
	"total_possible" integer DEFAULT 100 NOT NULL,
	"grade" text DEFAULT 'F' NOT NULL,
	"eval_coverage" integer DEFAULT 0 NOT NULL,
	"req_coverage" integer DEFAULT 0 NOT NULL,
	"format_compliance" integer DEFAULT 0 NOT NULL,
	"eval_results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"req_results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"improvements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."rfp_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"overview" jsonb DEFAULT '{"projectName":"","client":"","budget":"","duration":"","summary":""}'::jsonb NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evaluation_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evaluation_items" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"traceability_matrix" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"qualifications" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strategy_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommended_chapters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scope" jsonb DEFAULT '{"inScope":[],"outOfScope":[]}'::jsonb NOT NULL,
	"constraints" jsonb DEFAULT '{"technical":[],"business":[],"timeline":[]}'::jsonb NOT NULL,
	"keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"analyzed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."rfp_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_data" "bytea" NOT NULL,
	"file_size" integer NOT NULL,
	"raw_text" text DEFAULT '' NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"file_path" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aiprowriter"."tenant_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"app_name" text DEFAULT 'AIPROWRITER' NOT NULL,
	"logo_url" text DEFAULT '' NOT NULL,
	"primary_color" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aiprowriter"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "aiprowriter"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."output_files" ADD CONSTRAINT "output_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."price_proposals" ADD CONSTRAINT "price_proposals_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."project_members" ADD CONSTRAINT "project_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "aiprowriter"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."prompt_template_versions" ADD CONSTRAINT "prompt_template_versions_template_id_prompt_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "aiprowriter"."prompt_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."prompt_template_versions" ADD CONSTRAINT "prompt_template_versions_changed_by_profiles_id_fk" FOREIGN KEY ("changed_by") REFERENCES "aiprowriter"."profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."proposal_directions" ADD CONSTRAINT "proposal_directions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."proposal_outlines" ADD CONSTRAINT "proposal_outlines_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."proposal_sections" ADD CONSTRAINT "proposal_sections_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."proposal_sections" ADD CONSTRAINT "proposal_sections_outline_id_proposal_outlines_id_fk" FOREIGN KEY ("outline_id") REFERENCES "aiprowriter"."proposal_outlines"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."proposal_strategies" ADD CONSTRAINT "proposal_strategies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."review_reports" ADD CONSTRAINT "review_reports_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."rfp_analyses" ADD CONSTRAINT "rfp_analyses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aiprowriter"."rfp_files" ADD CONSTRAINT "rfp_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "aiprowriter"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "aiprowriter"."audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "aiprowriter"."audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "aiprowriter"."audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "output_files_project_id_idx" ON "aiprowriter"."output_files" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "price_proposals_project_id_idx" ON "aiprowriter"."price_proposals" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_members_project_id_idx" ON "aiprowriter"."project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_members_user_id_idx" ON "aiprowriter"."project_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_members_project_user_idx" ON "aiprowriter"."project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "projects_created_at_idx" ON "aiprowriter"."projects" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "prompt_versions_template_id_idx" ON "aiprowriter"."prompt_template_versions" USING btree ("template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_templates_slug_idx" ON "aiprowriter"."prompt_templates" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "prompt_templates_category_idx" ON "aiprowriter"."prompt_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "proposal_directions_project_id_idx" ON "aiprowriter"."proposal_directions" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "proposal_outlines_project_id_idx" ON "aiprowriter"."proposal_outlines" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "proposal_sections_project_id_idx" ON "aiprowriter"."proposal_sections" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "proposal_sections_outline_id_idx" ON "aiprowriter"."proposal_sections" USING btree ("outline_id");--> statement-breakpoint
CREATE INDEX "proposal_strategies_project_id_idx" ON "aiprowriter"."proposal_strategies" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "review_reports_project_id_idx" ON "aiprowriter"."review_reports" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "rfp_analyses_project_id_idx" ON "aiprowriter"."rfp_analyses" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "rfp_files_project_id_idx" ON "aiprowriter"."rfp_files" USING btree ("project_id");