// A simple logger that can be expanded later.
// For now, it just uses console.log, but could be replaced with a more robust logger like Winston.

export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`INFO > ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`WARN > ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`ERROR > ${message}`, ...args);
  },
};
