import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default [
    {
        input: 'src/index.ts',
        output: {
            format: 'cjs',
            dir: 'lib',
            exports: 'named',
            compact: true,
        },
        plugins: [typescript({ declaration: true, declarationDir: 'lib' }), terser()],
    },
    {
        input: 'src/index.ts',
        output: {
            format: 'esm',
            file: 'lib/index.mjs',
        },
        plugins: [typescript(), terser()],
    },
];
