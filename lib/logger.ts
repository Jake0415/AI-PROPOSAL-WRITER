// 구조화 로거 (JSON 출력, requestId 지원)

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const MIN_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

interface LogContext {
  requestId?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  if (!shouldLog(level)) return;

  const entry = {
    level,
    msg: message,
    time: new Date().toISOString(),
    ...context,
  };

  const output = process.env.NODE_ENV === 'production'
    ? JSON.stringify(entry)
    : `[${entry.time}] ${level.toUpperCase()} ${message}${context ? ` ${JSON.stringify(context)}` : ''}`;

  switch (level) {
    case 'error': console.error(output); break;
    case 'warn': console.warn(output); break;
    default: console.log(output); break;
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
};

// requestId 생성
export function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
