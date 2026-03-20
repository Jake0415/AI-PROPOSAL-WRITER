'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MemberInfo {
  name: string;
  avatarUrl: string | null;
  role: string;
}

interface MemberAvatarGroupProps {
  members: MemberInfo[];
  maxDisplay?: number;
}

const ROLE_LABELS: Record<string, string> = {
  owner: '소유자',
  editor: '편집자',
  viewer: '뷰어',
};

export function MemberAvatarGroup({ members, maxDisplay = 3 }: MemberAvatarGroupProps) {
  if (members.length === 0) return null;

  const displayed = members.slice(0, maxDisplay);
  const remaining = members.length - maxDisplay;

  return (
    <TooltipProvider>
      <div className="flex -space-x-2">
        {displayed.map((member, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Avatar className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {member.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {member.name} ({ROLE_LABELS[member.role] ?? member.role})
              </p>
            </TooltipContent>
          </Tooltip>
        ))}
        {remaining > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                  +{remaining}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {members.slice(maxDisplay).map((m) => m.name).join(', ')}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
