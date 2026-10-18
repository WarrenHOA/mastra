import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

async function expectFile(path: string) {
  await expect(access(path)).resolves.toBeUndefined();
}

type PackageJson = {
  files?: string[];
  scripts?: Record<string, string>;
  exports?: Record<string, unknown>;
};

describe('published package artifacts', () => {
  it('declares the dist artifacts required by published imports', async () => {
    const packageRoot = resolve(import.meta.dirname, '../..');
    const packageJson = JSON.parse(
      await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
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

  it('has runtime and declaration files for the published entry points', async () => {
    const distRoot = resolve(import.meta.dirname, '../../dist');

    await expectFile(resolve(distRoot, 'index.js'));
    await expectFile(resolve(distRoot, 'index.d.ts'));
    await expectFile(resolve(distRoot, 'boards/index.js'));
    await expectFile(resolve(distRoot, 'boards/index.d.ts'));
  });
});