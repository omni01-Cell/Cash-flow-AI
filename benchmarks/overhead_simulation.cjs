
const { performance } = require('perf_hooks');

async function simulateGetUser() {
  // Simulate network latency of 50ms for a local/fast auth check
  return new Promise(resolve => setTimeout(() => resolve({ user: { id: '123' } }), 50));
}

async function runBenchmark() {
  const iterations = 100;

  // Baseline: Redundant Fetch
  const startA = performance.now();
  for (let i = 0; i < iterations; i++) {
    const user = await simulateGetUser();
    if (!user) continue;
  }
  const endA = performance.now();
  const durationA = endA - startA;

  // Optimized: Prop Access (instant)
  const startB = performance.now();
  for (let i = 0; i < iterations; i++) {
    const userId = '123'; // Passed as prop
    if (!userId) continue;
  }
  const endB = performance.now();
  const durationB = endB - startB;

  console.log(`Results over ${iterations} iterations:`);
  console.log(`With Redundant Fetch: ${durationA.toFixed(2)}ms`);
  console.log(`With Prop Access:     ${durationB.toFixed(2)}ms`);
  console.log(`Improvement:          ${(durationA - durationB).toFixed(2)}ms saved`);
  console.log(`Average Saving/Op:    ${((durationA - durationB) / iterations).toFixed(2)}ms`);
}

runBenchmark();
