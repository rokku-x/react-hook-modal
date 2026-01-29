import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'path'
import pkg from './package.json';

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
        minify: 'esbuild',
        lib: {
            entry: {
                index: 'src/index.ts',
            },
            formats: ['es', 'cjs'],
            name: 'react-hook-modal',
            fileName: (format, entryName) => {
                const ext = format === 'es' ? 'esm' : 'cjs'
                return `${entryName}.${ext}.js`
            }
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime', ...Object.keys(pkg.peerDependencies || {})],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'react/jsx-runtime'
                }
            }
        }
    }
})
