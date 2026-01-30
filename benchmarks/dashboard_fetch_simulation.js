
const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const mockSupabase = {
  auth: {
    getUser: async () => {
      await simulateDelay(50); // Simulate auth check latency
      return { data: { user: { id: 'user-123' } } };
    }
  },
  from: (table) => {
    return {
      select: async () => {
        await simulateDelay(100); // Simulate DB fetch latency
        return { data: [{ id: 1, amount: 100 }], error: null };
      }
    };
  }
};

async function benchmarkCurrent() {
  const start = performance.now();

  // 1. Get User
  const { data: { user } } = await mockSupabase.auth.getUser();
  if (!user) return;

  // 2. Fetch Data
  const { data } = await mockSupabase.from('invoices').select('*');

  const end = performance.now();
  return end - start;
}

async function benchmarkOptimized(userId) {
  const start = performance.now();

  // 1. Fetch Data directly using userId (skipping getUser)
  if (userId) {
      const { data } = await mockSupabase.from('invoices').select('*');
  }

  const end = performance.now();
  return end - start;
}

async function run() {
  console.log("Running Benchmark: Dashboard Fetch Scenario");
  console.log("-------------------------------------------");

  const iterations = 5;
  let currentTotal = 0;
  let optimizedTotal = 0;

  for (let i = 0; i < iterations; i++) {
    currentTotal += await benchmarkCurrent();
    optimizedTotal += await benchmarkOptimized('user-123');
  }

  const avgCurrent = currentTotal / iterations;
  const avgOptimized = optimizedTotal / iterations;

  console.log(`Baseline (getUser + fetch): ~${avgCurrent.toFixed(2)}ms`);
  console.log(`Optimized (fetch only):     ~${avgOptimized.toFixed(2)}ms`);
  console.log(`Improvement:                ~${(avgCurrent - avgOptimized).toFixed(2)}ms per load`);
  console.log(`Percent Improvement:        ~${((avgCurrent - avgOptimized) / avgCurrent * 100).toFixed(1)}%`);
}

run();
