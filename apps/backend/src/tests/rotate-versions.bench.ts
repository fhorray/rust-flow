
const NUM_VERSIONS_TO_DELETE = 10;
const DB_LATENCY_MS = 50; // Simulate 50ms round-trip latency for D1

// Simulate a DB operation with latency
async function mockDelete(ids: string | string[]) {
    // In a real scenario, this would be a network call to D1
    return new Promise(resolve => setTimeout(resolve, DB_LATENCY_MS));
}

async function rotateVersionsSequential(versionIds: string[]) {
    // Current implementation: N+1 deletes
    for (const id of versionIds) {
        await mockDelete(id);
    }
}

async function rotateVersionsBatch(versionIds: string[]) {
    // Optimized implementation: Single delete query using inArray
    if (versionIds.length > 0) {
        await mockDelete(versionIds);
    }
}

async function runBenchmark() {
    const versionIds = Array.from({ length: NUM_VERSIONS_TO_DELETE }, (_, i) => `ver_${i}`);

    console.log(`--- Running benchmark with ${NUM_VERSIONS_TO_DELETE} versions to delete and ${DB_LATENCY_MS}ms latency ---`);

    // Measure Sequential
    const startSeq = performance.now();
    await rotateVersionsSequential(versionIds);
    const endSeq = performance.now();
    const durationSeq = endSeq - startSeq;
    console.log(`Sequential (Current): ${durationSeq.toFixed(2)}ms`);

    // Measure Batch
    const startBatch = performance.now();
    await rotateVersionsBatch(versionIds);
    const endBatch = performance.now();
    const durationBatch = endBatch - startBatch;
    console.log(`Batch (Optimized): ${durationBatch.toFixed(2)}ms`);

    // Calculate Improvement
    const improvement = ((durationSeq - durationBatch) / durationSeq) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}%`);

    // Estimate throughput gain
    console.log(`Throughput gain: ${(durationSeq / durationBatch).toFixed(1)}x faster`);
}

runBenchmark().catch(console.error);
