import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'], // The main entry point
	format: ['esm', 'cjs'], // Build both ESM and CommonJS formats
	dts: true, // Generate TypeScript declarations
	sourcemap: true, // Include source maps for debugging
	clean: true, // Clean previous builds before bundling
	minify: false, // Disable minification for better readability
	external: ['react', 'react-dom'], // Keep react as an external dependency
	outExtension: ({ format }) => ({
		js: format === 'esm' ? '.mjs' : '.cjs',
	}),
});
