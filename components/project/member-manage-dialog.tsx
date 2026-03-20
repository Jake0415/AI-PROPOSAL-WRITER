'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Trash2 } from 'lucide-react';

interface User {
  id: string;
  loginId: string;
  name: string;
  department: string;
  avatarUrl: string | null;
  role: string;
}

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    department: string;
    avatarUrl: string | null;
  };
}

interface MemberManageDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMembersChanged: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  owner: '소유자',
  editor: '편집자',
  viewer: '뷰어',
};

export function MemberManageDialog({
  projectId,
  open,
  onOpenChange,
  onMembersChanged,
}: MemberManageDialogProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('editor');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMembers();
      fetchUsers();
    }
  }, [open, projectId]);

  async function fetchMembers() {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.data ?? []);
      }
    } catch {
      // 무시
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data ?? []);
      }
    } catch {
      // 무시
    }
  }

  async function handleAddMember() {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, role: selectedRole }),
      });
      if (res.ok) {
        setSelectedUserId('');
        await fetchMembers();
        onMembersChanged();
      }
    } catch {
      // 무시
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(memberId: string, role: string) {
    try {
      await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      await fetchMembers();
      onMembersChanged();
    } catch {
      // 무시
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
      });
      await fetchMembers();
      onMembersChanged();
    } catch {
      // 무시
    }
  }

  // 이미 멤버인 사용자 제외 + 검색 필터
  const memberUserIds = new Set(members.map((m) => m.user.id));
  const availableUsers = users.filter(
    (u) =>
      !memberUserIds.has(u.id) &&
      (searchQuery === '' ||
        u.name.includes(searchQuery) ||
        u.department.includes(searchQuery) ||
        u.loginId.includes(searchQuery)),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>담당자 관리</DialogTitle>
        </DialogHeader>

        {/* 멤버 추가 */}
        <div className="space-y-3">
          <div className="text-sm font-medium">멤버 추가</div>
          <Input
            placeholder="이름, 부서, 아이디로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchQuery && availableUsers.length > 0 && (
            <div className="max-h-32 overflow-y-auto border rounded-md divide-y">
              {availableUsers.slice(0, 5).map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSearchQuery(user.name);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left ${
                    selectedUserId === user.id ? 'bg-muted' : ''
                  }`}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{user.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                  <span className="text-muted-foreground">{user.department}</span>
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">소유자</SelectItem>
                <SelectItem value="editor">편집자</SelectItem>
                <SelectItem value="viewer">뷰어</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddMember} disabled={!selectedUserId || loading} size="sm">
              <UserPlus className="mr-1 h-4 w-4" />
              추가
            </Button>
          </div>
        </div>

        {/* 현재 멤버 목록 */}
        <div className="space-y-3 mt-4">
          <div className="text-sm font-medium">현재 멤버 ({members.length}명)</div>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">배정된 멤버가 없습니다</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-md border"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {member.user.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{member.user.name}</div>
                    <div className="text-xs text-muted-foreground">{member.user.department}</div>
                  </div>
                  <Select
                    value={member.role}
                    onValueChange={(role) => handleRoleChange(member.id, role)}
                  >
                    <SelectTrigger className="w-[100px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">소유자</SelectItem>
                      <SelectItem value="editor">편집자</SelectItem>
                      <SelectItem value="viewer">뷰어</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
