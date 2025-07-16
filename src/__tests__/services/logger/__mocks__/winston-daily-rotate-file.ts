class DailyRotateFile {
  constructor(config: any) {
    return {
      level: config.level,
      filename: config.filename,
      on: jest.fn()
    };
  }
}

export default DailyRotateFile;
