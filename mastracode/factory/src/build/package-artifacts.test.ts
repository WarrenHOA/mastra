import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type PackageJson = {
  files?: string[];
  scripts?: Record<string, string>;
  exports?: Record<string, unknown>;
};

describe('published package artifacts', () => {
  it('builds dist during git dependency installation and publishes it', async () => {
    const packageJson = JSON.parse(
      await readFile(resolve(import.meta.dirname, '../../package.json'), 'utf8'),
    ) as PackageJson;

    expect(packageJson.files).toContain('dist');
    expect(packageJson.scripts?.prepare).toBe('pnpm build:lib');
    expect(packageJson.scripts?.build).toBe('pnpm build:lib');
    expect(packageJson.exports?.['./*']).toEqual({
      import: {
        types: './dist/*.d.ts',
        default: './dist/*.js',
      },
    });
  });
});