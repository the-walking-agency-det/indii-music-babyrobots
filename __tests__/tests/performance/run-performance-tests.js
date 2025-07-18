import { PerformanceTestRunner } from './core-performance-platform.js';

async function runPerformanceTests() {
  console.log('Starting Performance Test Suite');
  console.log('==============================\n');

  // Phase 1: Single Agent Testing
  console.log('Phase 1: Single Agent Testing');
  const singleAgentRunner = new PerformanceTestRunner(1);
  const singleResults = await singleAgentRunner.runSingleAgentTest();
  const singleValid = singleAgentRunner.validateResults(singleResults);

  // Phase 2: Small Scale Concurrent Testing (10 agents)
  console.log('\nPhase 2: Small Scale Concurrent Testing');
  const smallScaleRunner = new PerformanceTestRunner(10);
  const smallScaleResults = await smallScaleRunner.runConcurrentTest();
  const smallScaleValid = smallScaleRunner.validateResults(smallScaleResults);

  // Phase 3: Medium Scale Concurrent Testing (50 agents)
  console.log('\nPhase 3: Medium Scale Concurrent Testing');
  const mediumScaleRunner = new PerformanceTestRunner(50);
  const mediumScaleResults = await mediumScaleRunner.runConcurrentTest();
  const mediumScaleValid = mediumScaleRunner.validateResults(mediumScaleResults);

  // Phase 4: Large Scale Concurrent Testing (100 agents)
  console.log('\nPhase 4: Large Scale Concurrent Testing');
  const largeScaleRunner = new PerformanceTestRunner(100);
  const largeScaleResults = await largeScaleRunner.runConcurrentTest();
  const largeScaleValid = largeScaleRunner.validateResults(largeScaleResults);

  // Final Results Summary
  console.log('\n==============================');
  console.log('Final Test Results Summary');
  console.log('==============================');
  console.log(`Single Agent Tests: ${singleValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Small Scale Tests: ${smallScaleValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Medium Scale Tests: ${mediumScaleValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Large Scale Tests: ${largeScaleValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log('==============================\n');

  return {
    singleAgent: singleResults,
    smallScale: smallScaleResults,
    mediumScale: mediumScaleResults,
    largeScale: largeScaleResults,
    allTestsPassed: singleValid && smallScaleValid && mediumScaleValid && largeScaleValid
  };
}

// Run the tests
runPerformanceTests().catch(console.error);
