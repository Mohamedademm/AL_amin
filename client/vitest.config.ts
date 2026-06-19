import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Vitest runs in a jsdom environment so component tests can render React.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
