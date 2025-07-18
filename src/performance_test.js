// src/performance_test.js

import { initializeAgents } from './main.js';

async function runPerformanceTest() {
  const numConcurrentRuns = 1000; // Number of concurrent initializations
  const initializationPromises = [];

  console.log(`\n--- Running performance test for initializeAgents (${numConcurrentRuns} concurrent runs) ---`);

  const overallStartTime = process.hrtime.bigint();

  for (let i = 0; i < numConcurrentRuns; i++) {
    initializationPromises.push(initializeAgents());
  }

  await Promise.all(initializationPromises);

  const overallendTime = process.hrtime.bigint();
  const overallDurationMs = Number(overallendTime - overallStartTime) / 1_000_000; // Convert nanoseconds to milliseconds

  console.log(`\nTotal time for ${numConcurrentRuns} concurrent initializations: ${overallDurationMs.toFixed(2)} ms`);

  const targetTime = 2000; // 2 seconds in milliseconds
  if (overallDurationMs < targetTime) {
    console.log(`✅ Performance target met: Total concurrent initialization time (${overallDurationMs.toFixed(2)} ms) is less than ${targetTime} ms.`);
  } else {
    console.log(`❌ Performance target NOT met: Total concurrent initialization time (${overallDurationMs.toFixed(2)} ms) is greater than or equal to ${targetTime} ms.`);
  }
}

runPerformanceTest().catch(console.error);
