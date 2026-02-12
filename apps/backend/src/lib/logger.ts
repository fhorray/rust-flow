type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Structured logger for Progy Backend
 * Outputs logs as objects for better observability in Cloudflare Workers
 */
export const logger = {
  info: (tag: string, message: string, data?: any) => {
    console.log({
      level: 'info',
      tag,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    });
  },

  warn: (tag: string, message: string, data?: any) => {
    console.warn({
      level: 'warn',
      tag,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    });
  },

  error: (tag: string, message: string, data?: any) => {
    const errorData = data instanceof Error ? { error: data.message, stack: data.stack } : data;
    console.error({
      level: 'error',
      tag,
      message,
      timestamp: new Date().toISOString(),
      ...errorData,
    });
  },

  debug: (tag: string, message: string, data?: any) => {
    console.log({
      level: 'debug',
      tag,
      message,
      timestamp: new Date().toISOString(),
      ...data,
    });
  },
};
