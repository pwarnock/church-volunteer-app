/**
 * Test Data Storage System
 *
 * Domain: Test data persistence
 * Responsibility: Store and retrieve test data with versioning
 * Boundaries: File-based storage only, no database operations
 */

import {
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from 'fs';
import { join } from 'path';
import { TestMetricsCollector } from '@/lib/test-metrics';

export interface TestDataStorage {
  save(type: string, data: any): string;
  load(type: string, id?: string): any;
  history(type: string, limit?: number): any[];
  delete(type: string, id: string): void;
}

export class FileBasedTestDataStorage implements TestDataStorage {
  private dataDir: string;
  private cacheDir: string;
  private historyDir: string;

  constructor(baseDir: string = '.test-data') {
    this.dataDir = join(baseDir, 'data');
    this.cacheDir = join(baseDir, 'cache');
    this.historyDir = join(baseDir, 'history');

    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    [this.dataDir, this.cacheDir, this.historyDir].forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  save(type: string, data: any): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const id = `${type}_${timestamp}.json`;
    const filepath = join(this.dataDir, type, id);

    // Ensure type directory exists
    const typeDir = join(this.dataDir, type);
    if (!existsSync(typeDir)) {
      mkdirSync(typeDir, { recursive: true });
    }

    try {
      const fileData = {
        id,
        type,
        timestamp: new Date().toISOString(),
        version: this.getNextVersion(type),
        tags: [type, 'generated'],
        data,
      };

      writeFileSync(filepath, JSON.stringify(fileData, null, 2));

      // Also save to history
      const historyFile = join(this.historyDir, id);
      writeFileSync(historyFile, JSON.stringify(fileData, null, 2));

      console.log(`💾 Test data saved: ${id}`);
      return id;
    } catch (error) {
      console.error(`Failed to save test data:`, error);
      return '';
    }
  }

  load(type: string, id?: string): any {
    // Try to load specific version first
    if (id) {
      const filepath = join(this.dataDir, type, id);
      if (existsSync(filepath)) {
        try {
          const content = readFileSync(filepath, 'utf-8');
          return JSON.parse(content).data;
        } catch (error) {
          console.error(`Failed to load test data from ${filepath}:`, error);
        }
      }
    }

    // Fall back to latest version
    const typeDir = join(this.dataDir, type);
    if (!existsSync(typeDir)) {
      return null;
    }

    const files = readdirSync(typeDir)
      .filter((file) => file.endsWith('.json'))
      .sort((a, b) => {
        const statA = require('fs').statSync(join(typeDir, a));
        const statB = require('fs').statSync(join(typeDir, b));
        return statB.mtime.getTime() - statA.mtime.getTime();
      });

    if (files.length === 0) {
      return null;
    }

    const latestFile = files[0];
    const filepath = join(typeDir, latestFile);

    try {
      const content = readFileSync(filepath, 'utf-8');
      return JSON.parse(content).data;
    } catch (error) {
      console.error(`Failed to load latest test data:`, error);
      return null;
    }
  }

  history(type: string, limit: number = 10): any[] {
    try {
      const files = readdirSync(this.historyDir)
        .filter((file) => file.startsWith(`${type}_`) && file.endsWith('.json'))
        .sort((a, b) => {
          const statA = require('fs').statSync(join(this.historyDir, a));
          const statB = require('fs').statSync(join(this.historyDir, b));
          return statB.mtime.getTime() - statA.mtime.getTime();
        })
        .slice(0, limit);

      return files
        .map((file) => {
          const filepath = join(this.historyDir, file);
          try {
            const content = readFileSync(filepath, 'utf-8');
            return JSON.parse(content);
          } catch (error) {
            console.error(`Failed to load history file ${file}:`, error);
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      console.error(`Failed to load test history for type ${type}:`, error);
      return [];
    }
  }

  delete(type: string, id: string): void {
    const filepath = join(this.dataDir, type, id);

    try {
      if (existsSync(filepath)) {
        require('fs').unlinkSync(filepath);
        console.log(`🗑️ Deleted test data: ${filepath}`);
      }
    } catch (error) {
      console.error(`Failed to delete test data ${filepath}:`, error);
    }
  }

  private getNextVersion(type: string): number {
    const history = this.history(type, 1);
    return history.length > 0 ? history[0].version + 1 : 1;
  }

  // Cache management for performance
  getCached(type: string, id: string): any {
    const cacheFile = join(this.cacheDir, `${type}_${id}.json`);

    if (existsSync(cacheFile)) {
      try {
        const content = readFileSync(cacheFile, 'utf-8');
        const cached = JSON.parse(content);

        // Check if cache is still valid (24 hours)
        const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
        if (cacheAge < 24 * 60 * 60 * 1000) {
          return cached.data;
        }
      } catch (error) {
        console.warn(`Failed to read cache file ${cacheFile}:`, error);
      }
    }

    return null;
  }

  setCached(type: string, id: string, data: any): void {
    const cacheFile = join(this.cacheDir, `${type}_${id}.json`);

    try {
      writeFileSync(
        cacheFile,
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            data,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.warn(`Failed to write cache file ${cacheFile}:`, error);
    }
  }

  clearCache(type?: string): void {
    try {
      const files = readdirSync(this.cacheDir);
      files.forEach((file) => {
        if (!type || file.startsWith(`${type}_`)) {
          require('fs').unlinkSync(join(this.cacheDir, file));
        }
      });
      console.log(`🧹 Cleared cache${type ? ` for type: ${type}` : ''}`);
    } catch (error) {
      console.error(`Failed to clear cache:`, error);
    }
  }
}

// Global storage instance
export const testDataStorage = new FileBasedTestDataStorage();
