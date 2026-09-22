import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only this checkout's tests — .claude/worktrees/* are stale parallel checkouts
    // whose copies of the same files would otherwise run (and fail) alongside ours.
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '.claude/**'],
  },
});
