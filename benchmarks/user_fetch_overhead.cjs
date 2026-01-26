const { performance } = require('perf_hooks');

async function benchmark() {
  console.log('Running User Fetch Overhead Benchmark...');

  // Mock supabase.auth.getUser
  const mockGetUser = async () => {
    // Simulate async operation (e.g. check local storage, potential network call)
    return new Promise(resolve => setTimeout(() => {
      resolve({ data: { user: { id: 'user-123' } } });
    }, 50)); // 50ms simulated delay
  };

  const iterations = 100;

  // Measure "Fetching" approach
  const startFetch = performance.now();
  for (let i = 0; i < iterations; i++) {
    const { data: { user } } = await mockGetUser();
    if (!user) continue;
    // ... rest of logic
  }
  const endFetch = performance.now();
  const fetchTime = endFetch - startFetch;

  // Measure "Prop" approach
  const userId = 'user-123';
  const startProp = performance.now();
  for (let i = 0; i < iterations; i++) {
    const user = userId; // Direct access
    if (!user) continue;
    // ... rest of logic
  }
  const endProp = performance.now();
  const propTime = endProp - startProp;

  console.log(`\nResults over ${iterations} iterations:`);
  console.log(`With getUser() (simulated 50ms latency): ${fetchTime.toFixed(2)}ms`);
  console.log(`With Props (direct access): ${propTime.toFixed(2)}ms`);
  console.log(`\nSpeedup: ${(fetchTime / propTime).toFixed(2)}x`);
  console.log(`Time saved per render: ~${(fetchTime / iterations).toFixed(2)}ms`);
}

benchmark();
