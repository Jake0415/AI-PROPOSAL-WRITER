'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LayoutGrid, List, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProjectFilterBarProps {
  statusFilter: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
}

const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'uploaded', label: 'RFP 업로드됨' },
  { value: 'analyzing', label: '분석 중' },
  { value: 'direction_set', label: '방향 설정됨' },
  { value: 'strategy_set', label: '전략 수립됨' },
  { value: 'outline_ready', label: '목차 구성됨' },
  { value: 'generating', label: '내용 생성 중' },
  { value: 'sections_ready', label: '섹션 완료' },
  { value: 'reviewing', label: '검토 중' },
  { value: 'completed', label: '완료' },
];

export function ProjectFilterBar({
  statusFilter,
  searchQuery,
  onStatusChange,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: ProjectFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // 디바운스: 300ms 후 검색어 반영
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="프로젝트 검색..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={statusFilter} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="상태 필터" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-1 ml-auto">
        <Button
          variant={viewMode === 'card' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewModeChange('card')}
          aria-label="카드 뷰"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onViewModeChange('table')}
          aria-label="테이블 뷰"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
