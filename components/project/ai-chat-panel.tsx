'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Loader2, X } from 'lucide-react';
import type { ConversationTopic } from '@/lib/db/schema';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface AiChatPanelProps {
  projectId: string;
  userId: string;
  topic: ConversationTopic;
  stageContext?: Record<string, unknown>;
}

export function AiChatPanel({ projectId, userId, topic, stageContext }: AiChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messageList, streamingContent, scrollToBottom]);

  // 대화 시작 또는 기존 대화 로드
  useEffect(() => {
    if (!open) return;

    async function loadOrCreate() {
      // 기존 대화 검색
      const listRes = await fetch(`/api/projects/${projectId}/conversations`);
      const listData = await listRes.json();
      if (listData.success && listData.data.length > 0) {
        const existing = listData.data.find(
          (c: { topic: string; status: string }) => c.topic === topic && c.status === 'active'
        );
        if (existing) {
          setConversationId(existing.id);
          const detailRes = await fetch(`/api/projects/${projectId}/conversations/${existing.id}`);
          const detailData = await detailRes.json();
          if (detailData.success && detailData.data.messages) {
            setMessageList(detailData.data.messages);
          }
          return;
        }
      }

      // 새 대화 생성
      const createRes = await fetch(`/api/projects/${projectId}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, topic, stageContext }),
      });
      const createData = await createRes.json();
      if (createData.success) {
        setConversationId(createData.data.id);
        setMessageList([]);
      }
    }

    loadOrCreate();
  }, [open, projectId, userId, topic, stageContext]);

  async function handleSend() {
    if (!input.trim() || !conversationId || streaming) return;

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessageList(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    setStreamingContent('');

    try {
      const res = await fetch(
        `/api/projects/${projectId}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg.content }),
        },
      );

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.type === 'chunk') {
              fullContent += parsed.content;
              setStreamingContent(fullContent);
            }
          } catch { /* 무시 */ }
        }
      }

      if (fullContent) {
        setMessageList(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fullContent,
          createdAt: new Date().toISOString(),
        }]);
      }
    } catch { /* 네트워크 에러 */ } finally {
      setStreaming(false);
      setStreamingContent('');
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const topicLabels: Record<ConversationTopic, string> = {
    'rfp-analysis': 'RFP 분석',
    'direction-coaching': '방향성',
    'strategy-coaching': '전략',
    'outline-coaching': '목차',
    'section-editing': '섹션',
    'review-coaching': '검증',
    'price-coaching': '가격',
    'general': '일반',
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageCircle className="h-4 w-4" />
          AI 코칭
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[420px] sm:w-[480px] flex flex-col p-0">
        <SheetHeader className="p-4 pb-2 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">
              AI 코칭 — {topicLabels[topic]}
            </SheetTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messageList.length === 0 && !streaming && (
            <p className="text-sm text-muted-foreground text-center py-8">
              AI에게 질문하세요. 현재 단계의 맥락을 이해하고 답변합니다.
            </p>
          )}
          {messageList.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {streaming && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-muted whitespace-pre-wrap">
                {streamingContent}
                <span className="animate-pulse">▊</span>
              </div>
            </div>
          )}
          {streaming && !streamingContent && (
            <div className="flex justify-start">
              <div className="rounded-lg px-3 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="border-t p-3 shrink-0">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요... (Enter로 전송)"
              rows={2}
              className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={streaming}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="shrink-0 self-end"
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
