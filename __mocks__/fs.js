const fs = require('fs');

// Mock file system data store
let mockFiles = Object.create(null);
let mockDirectories = Object.create(null);

// Helper to create mock paths
function __setMockFiles(newMockFiles) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    const dir = file.split('/').slice(0, -1).join('/');
    if (!mockDirectories[dir]) {
      mockDirectories[dir] = [];
    }
    mockDirectories[dir].push(file.split('/').pop());
    mockFiles[file] = newMockFiles[file];
  }
}

// Mock readFileSync
function readFileSync(path, options) {
  if (mockFiles[path]) {
    return mockFiles[path];
  }
  throw new Error(`ENOENT: no such file or directory, open '${path}'`);
}

// Mock writeFileSync
function writeFileSync(path, data, options) {
  const dir = path.split('/').slice(0, -1).join('/');
  if (!mockDirectories[dir]) {
    mockDirectories[dir] = [];
  }
  mockDirectories[dir].push(path.split('/').pop());
  mockFiles[path] = data;
}

// Mock existsSync
function existsSync(path) {
  return mockFiles[path] !== undefined;
}

// Mock readdirSync
function readdirSync(path) {
  if (mockDirectories[path]) {
    return mockDirectories[path];
  }
  throw new Error(`ENOENT: no such file or directory, scandir '${path}'`);
}

// Mock promises API
const promises = {
  readFile: async (path, options) => {
    return readFileSync(path, options);
  },
  writeFile: async (path, data, options) => {
    writeFileSync(path, data, options);
  },
  readdir: async (path) => {
    return readdirSync(path);
  }
};

fs.__setMockFiles = __setMockFiles;
fs.readFileSync = readFileSync;
fs.writeFileSync = writeFileSync;
fs.existsSync = existsSync;
fs.readdirSync = readdirSync;
fs.promises = promises;

module.exports = fs;
