import { StepNavigation } from '@/components/project/step-navigation';
import { StepTipsPanel } from '@/components/guide/step-tips-panel';
import { projectRepository } from '@/lib/repositories/project.repository';

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params;

  const project = await projectRepository.findById(id);
  const currentStatus = project?.status ?? 'uploaded';

  return (
    <div className="flex min-h-[calc(100vh-3.5rem-3rem)]">
      <StepNavigation projectId={id} currentStatus={currentStatus} />
      <div className="flex-1 p-6">{children}</div>
      <StepTipsPanel />
    </div>
  );
}
