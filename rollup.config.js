import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'src/index.ts',
        output: {
            format: 'cjs',
            dir: 'lib',
            compact: true,
        },
        plugins: [typescript({ declaration: true, declarationDir: 'lib' })],
    },
    {
        input: 'src/index.ts',
        output: {
            format: 'esm',
            file: 'lib/index.mjs',
        },
        plugins: [typescript()],
    },
];
