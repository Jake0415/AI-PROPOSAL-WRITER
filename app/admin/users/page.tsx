'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Pencil, X } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  super_admin: '최고관리자',
  admin: '관리자',
  proposal_pm: '제안PM',
  tech_writer: '기술작성자',
  viewer: '뷰어',
};

const ASSIGNABLE_ROLES = ['admin', 'proposal_pm', 'tech_writer', 'viewer'];

interface User {
  id: string;
  loginId: string;
  name: string;
  phone: string;
  department: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    loginId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    department: '',
    role: 'viewer',
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch {
      setError('사용자 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function resetForm() {
    setForm({ loginId: '', password: '', passwordConfirm: '', name: '', phone: '', department: '', role: 'viewer' });
    setFormError('');
    setShowForm(false);
    setEditUser(null);
  }

  function handleChange(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function startEdit(user: User) {
    setEditUser(user);
    setForm({
      loginId: user.loginId,
      password: '',
      passwordConfirm: '',
      name: user.name,
      phone: user.phone,
      department: user.department,
      role: user.role,
    });
    setShowForm(true);
    setFormError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!editUser && form.password !== form.passwordConfirm) {
      setFormError('비밀번호가 일치하지 않습니다');
      return;
    }

    setSubmitting(true);

    try {
      if (editUser) {
        // 수정
        const body: Record<string, string> = {
          name: form.name,
          phone: form.phone,
          department: form.department,
          role: form.role,
        };
        if (form.password) {
          if (form.password !== form.passwordConfirm) {
            setFormError('비밀번호가 일치하지 않습니다');
            setSubmitting(false);
            return;
          }
          body.password = form.password;
        }

        const res = await fetch(`/api/admin/users/${editUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!data.success) {
          setFormError(data.error?.message ?? '수정에 실패했습니다');
          setSubmitting(false);
          return;
        }
      } else {
        // 등록
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!data.success) {
          setFormError(data.error?.message ?? '등록에 실패했습니다');
          setSubmitting(false);
          return;
        }
      }

      resetForm();
      fetchUsers();
    } catch {
      setFormError('서버에 연결할 수 없습니다');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`${user.name} (${user.loginId}) 사용자를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error?.message ?? '삭제에 실패했습니다');
      }
    } catch {
      alert('서버에 연결할 수 없습니다');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          사용자 등록
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* 사용자 등록/수정 폼 */}
      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">{editUser ? '사용자 수정' : '사용자 등록'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="form-loginId">아이디 *</Label>
                <Input
                  id="form-loginId"
                  value={form.loginId}
                  onChange={handleChange('loginId')}
                  disabled={!!editUser}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-password">비밀번호 {editUser ? '(변경 시에만 입력)' : '*'}</Label>
                <Input
                  id="form-password"
                  type="password"
                  placeholder="6자 이상"
                  value={form.password}
                  onChange={handleChange('password')}
                  required={!editUser}
                  minLength={editUser ? 0 : 6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-passwordConfirm">비밀번호 확인</Label>
                <Input
                  id="form-passwordConfirm"
                  type="password"
                  placeholder="비밀번호 재입력"
                  value={form.passwordConfirm}
                  onChange={handleChange('passwordConfirm')}
                  required={!editUser || !!form.password}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-name">이름 *</Label>
                <Input
                  id="form-name"
                  value={form.name}
                  onChange={handleChange('name')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-phone">전화번호</Label>
                <Input
                  id="form-phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={form.phone}
                  onChange={handleChange('phone')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-department">부서</Label>
                <Input
                  id="form-department"
                  value={form.department}
                  onChange={handleChange('department')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-role">역할</Label>
                <select
                  id="form-role"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={form.role}
                  onChange={handleChange('role')}
                  disabled={editUser?.role === 'super_admin'}
                >
                  {ASSIGNABLE_ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                {formError && <p className="text-sm text-destructive">{formError}</p>}
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editUser ? '수정' : '등록'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 사용자 목록 */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">아이디</th>
                  <th className="px-4 py-3 text-left font-medium">이름</th>
                  <th className="px-4 py-3 text-left font-medium">부서</th>
                  <th className="px-4 py-3 text-left font-medium">전화번호</th>
                  <th className="px-4 py-3 text-left font-medium">역할</th>
                  <th className="px-4 py-3 text-left font-medium">등록일</th>
                  <th className="px-4 py-3 text-right font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono">{user.loginId}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.department || '-'}</td>
                    <td className="px-4 py-3">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {user.role !== 'super_admin' && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      등록된 사용자가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
