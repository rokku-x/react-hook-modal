declare module '../../dist/index.esm.js' {
    const value: unknown;
    export default value;
}

declare module '../../dist/index.cjs.js' {
    const value: unknown;
    export default value;
}

declare module '../../dist/*' {
    const value: unknown;
    export default value;
}

declare module 'dist/*' {
    const value: unknown;
    export default value;
}

declare module '*/dist/*' {
    const value: unknown;
    export default value;
}