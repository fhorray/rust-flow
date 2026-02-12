
import { describe, test, expect } from 'bun:test';

// Mock R2Bucket for benchmarking
class MockR2Bucket {
  async put(key: string, value: any, options?: any) {
    // Simulate network latency ~50ms
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
        key,
        version: '1',
        size: value.byteLength,
        etag: 'etag',
        httpEtag: 'etag',
        checksums: {},
        uploaded: new Date(),
        storageClass: 'standard',
        writeHttpMetadata: () => {},
    };
  }
}

// Mock File for benchmarking
class MockFile {
    name: string;
    size: number;
    type: string;
    content: Uint8Array;

    constructor(content: Uint8Array, name: string, options: { type?: string } = {}) {
        this.content = content;
        this.name = name;
        this.size = content.length;
        this.type = options.type || '';
    }

    async arrayBuffer() {
        return this.content.buffer;
    }
}

// Prepare test data
const NUM_ASSETS = 20;
const assets: Record<string, MockFile> = {};
for (let i = 0; i < NUM_ASSETS; i++) {
    assets[`asset_${i}.png`] = new MockFile(new Uint8Array(1024), `asset_${i}.png`, { type: 'image/png' });
}
const prefix = 'packages/test/1.0.0/';
const userId = 'user_123';
const mockR2 = new MockR2Bucket();


// Sequential implementation (Current)
async function uploadSequential() {
    const ONE_MB = 1 * 1024 * 1024;
    for (const [k, v] of Object.entries(assets)) {
      if (v.size > ONE_MB) throw new Error(`Asset ${k} exceeds 1MB`);
      await mockR2.put(`${prefix}${k}`, await v.arrayBuffer(), {
        httpMetadata: { contentType: v.type || 'application/octet-stream' },
        customMetadata: { userId: userId },
      });
    }
}

// Parallel implementation (Optimized)
async function uploadParallel() {
    const ONE_MB = 1 * 1024 * 1024;

    await Promise.all(Object.entries(assets).map(async ([k, v]) => {
        if (v.size > ONE_MB) throw new Error(`Asset ${k} exceeds 1MB`);
        await mockR2.put(`${prefix}${k}`, await v.arrayBuffer(), {
            httpMetadata: { contentType: v.type || 'application/octet-stream' },
            customMetadata: { userId: userId },
        });
    }));
}

async function testErrorHandling() {
    console.log("Testing error handling...");
    const badAssets = { ...assets };
    badAssets['large.png'] = new MockFile(new Uint8Array(2 * 1024 * 1024), 'large.png'); // 2MB

    const ONE_MB = 1 * 1024 * 1024;

    try {
        await Promise.all(Object.entries(badAssets).map(async ([k, v]) => {
            if (v.size > ONE_MB) throw new Error(`Asset ${k} exceeds 1MB`);
            await mockR2.put(`${prefix}${k}`, await v.arrayBuffer(), {
                httpMetadata: { contentType: v.type || 'application/octet-stream' },
                customMetadata: { userId: userId },
            });
        }));
        console.error("Error handling failed: Should have thrown");
    } catch (e: any) {
        if (e.message.includes('exceeds 1MB')) {
             console.log("Error handling passed: " + e.message);
        } else {
             console.error("Error handling failed: Wrong error message " + e.message);
        }
    }
}

// Run benchmark manually for clearer output
async function runBenchmark() {
    console.log(`Starting benchmark with ${NUM_ASSETS} assets...`);

    const startSeq = performance.now();
    await uploadSequential();
    const endSeq = performance.now();
    const durationSeq = endSeq - startSeq;
    console.log(`Sequential upload took: ${durationSeq.toFixed(2)}ms`);

    const startPar = performance.now();
    await uploadParallel();
    const endPar = performance.now();
    const durationPar = endPar - startPar;
    console.log(`Parallel upload took: ${durationPar.toFixed(2)}ms`);

    const improvement = ((durationSeq - durationPar) / durationSeq) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}%`);

    await testErrorHandling();
}

if (import.meta.main) {
    runBenchmark();
}
