class Statement {
  constructor() {
    this.run = jest.fn();
    this.get = jest.fn();
    this.all = jest.fn();
    this.iterate = jest.fn();
  }
}

class Database {
  constructor() {
    this.inMemory = true;
    this.data = new Map();
    this.prepare = jest.fn(() => new Statement());
    this.transaction = jest.fn((fn) => fn());
    this.exec = jest.fn();
    this.close = jest.fn();
  }
}

module.exports = jest.fn(() => new Database());
