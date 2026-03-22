'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatPanelProps {
  projectId: string;
}

export function AiChatPanel({ projectId }: AiChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  async function handleSend() {
    const question = input.trim();
    if (!question || streaming) return;

    const userMsg: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    setStreamingContent('');
    scrollToBottom();

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(`/api/projects/${projectId}/rfp/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      });

      if (!res.ok || !res.body) {
        setMessages(prev => [...prev, { role: 'assistant', content: '답변 생성에 실패했습니다.' }]);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'chunk') {
              fullContent += event.content;
              setStreamingContent(fullContent);
              scrollToBottom();
            } else if (event.type === 'error') {
              fullContent = event.message ?? '오류가 발생했습니다';
            }
          } catch { /* 파싱 실패 무시 */ }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullContent || '답변을 생성할 수 없습니다.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '네트워크 오류가 발생했습니다.' }]);
    }

    setStreaming(false);
    setStreamingContent('');
    scrollToBottom();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <MessageCircle className="h-4 w-4" />
          RFP 질문
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[420px] sm:w-[480px] flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle className="text-base">RFP 질의응답</SheetTitle>
        </SheetHeader>

        {/* 메시지 영역 */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && !streaming && (
            <div className="text-center text-muted-foreground text-sm py-10">
              RFP에 대해 자유롭게 질문하세요.
              <br />
              <span className="text-xs">예: &ldquo;보안 요건이 뭐야?&rdquo;, &ldquo;예산이 얼마야?&rdquo;</span>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground whitespace-pre-wrap'
                  : 'bg-muted prose prose-sm dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'
              }`}>
                {msg.role === 'user' ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
              </div>
            </div>
          ))}

          {streaming && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-muted prose prose-sm dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown>{streamingContent}</ReactMarkdown>
                <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5" />
              </div>
            </div>
          )}

          {streaming && !streamingContent && (
            <div className="flex justify-start">
              <div className="rounded-lg px-3 py-2 text-sm bg-muted text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                RFP에서 관련 내용을 검색 중...
              </div>
            </div>
          )}
        </div>

        {/* 입력 영역 */}
        <div className="border-t px-4 py-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="RFP에 대해 질문하세요..."
              className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              rows={2}
              disabled={streaming}
            />
            <Button size="icon" onClick={handleSend} disabled={streaming || !input.trim()}>
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
