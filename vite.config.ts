import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'path'
import pkg from './package.json';
import preserveDirectives from 'rollup-plugin-preserve-directives';

function removeEmptyCssComments() {
    return {
        name: 'remove-empty-css-comments',
        generateBundle(_: any, bundle: any) {
            for (const fileName of Object.keys(bundle)) {
                const chunk = bundle[fileName];
                if (chunk.type === 'chunk' && typeof chunk.code === 'string') {
                    chunk.code = chunk.code.replace(/\/\* *empty css[^*]*\*\//g, '');
                }
            }
        },
    };
}

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    plugins: [
        react({
            jsxRuntime: 'automatic',
            jsxImportSource: 'react'
        }),
        dts({
            include: ['src/**/*'],
            exclude: ['src/main.tsx', 'src/**/*.test.*', 'src/**/*.spec.*', 'src/**/__tests__/**'],
            rollupTypes: false
        })
    ],
    build: {
        // 1. Use Terser instead of Esbuild to better preserve directives
        minify: 'terser',
        terserOptions: {
            compress: {
                directives: false,
            },
            format: {
                comments: false
            }
        },
        lib: {
            entry: {
                index: 'src/index.ts',
            },
            formats: ['es', 'cjs'],
            name: 'react-hook-modal',
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                ...Object.keys(pkg.peerDependencies || {})
            ],
            plugins: [preserveDirectives(), removeEmptyCssComments()],
            output: [
                {
                    format: 'es',
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    exports: 'named',
                    entryFileNames: '[name].esm.js',
                    globals: { react: 'React', 'react-dom': 'ReactDOM' }
                },
                {
                    format: 'cjs',
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    exports: 'named',
                    entryFileNames: '[name].cjs.js',
                    globals: { react: 'React', 'react-dom': 'ReactDOM' }
                }
            ]
        }
    }
})