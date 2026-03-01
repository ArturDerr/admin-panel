type LogLevel = "debug" | "info" | "warn" | "error";

type Logger = Record<LogLevel, (...args: unknown[]) => void>;

function canLog(): boolean {
  return import.meta.env?.DEV ?? true;
}

export function createLogger(scope: string): Logger {
  const prefix = `[${scope}]`;

  return {
    debug: (...args) => {
      if (canLog()) console.debug(prefix, ...args);
    },
    info: (...args) => {
      if (canLog()) console.info(prefix, ...args);
    },
    warn: (...args) => {
      if (canLog()) console.warn(prefix, ...args);
    },
    error: (...args) => {
      if (canLog()) console.error(prefix, ...args);
    },
  };
}
