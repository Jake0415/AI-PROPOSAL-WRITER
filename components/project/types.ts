// 대시보드에서 사용하는 프로젝트 확장 타입
export interface EnhancedProject {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  members?: {
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      department: string;
      avatarUrl: string | null;
    };
  }[];
  rfpAnalysis?: {
    projectName: string;
    client: string;
    budget: string;
    duration: string;
    summary: string;
  } | null;
}
