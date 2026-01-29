import { createClient } from '@supabase/supabase-js';

// Access environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are required.");
  console.error("Usage: VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... node benchmarks/overhead_benchmark.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function benchmark() {
  console.log('Starting benchmark for supabase.auth.getUser()...');

  const iterations = 5;
  let totalTime = 0;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await supabase.auth.getUser();
    const end = performance.now();
    const duration = end - start;
    console.log(`Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
    totalTime += duration;
  }

  const averageTime = totalTime / iterations;
  console.log(`Average time for getUser(): ${averageTime.toFixed(2)}ms`);

  console.log('---');
  console.log('Simulating optimized path (passing prop)...');
  const startOptimized = performance.now();
  // Simulating immediate access via prop (negligible time)
  const userId = "simulated-user-id";
  const endOptimized = performance.now();
  console.log(`Optimized time (prop access): ${(endOptimized - startOptimized).toFixed(4)}ms`);

  console.log(`\nPotential improvement per render: ~${averageTime.toFixed(2)}ms`);
}

benchmark();
