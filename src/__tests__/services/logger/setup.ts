// Mock Winston
const mockWinstonLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  log: jest.fn()
};

jest.mock('winston', () => ({
  format: {
combine: jest.fn(),
timestamp: jest.fn(),
errors: jest.fn(),
json: jest.fn(),
colorize: jest.fn(),
printf: jest.fn()
  },
  createLogger: jest.fn().mockReturnValue(mockWinstonLogger),
  addColors: jest.fn(),
  transports: {
    File: jest.fn(),
    Console: jest.fn()
  }
}));

// Mock Winston DailyRotateFile
jest.mock('winston-daily-rotate-file', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn()
  }));
});
