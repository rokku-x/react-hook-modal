/* @vitest-environment node */
import { describe, it, expect } from 'vitest'
import { performance } from 'node:perf_hooks'

describe('Library Load Time', () => {
    it('measures CJS require and ESM import times', async () => {
        const t0 = performance.now()
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const cjs = require('../../dist/index.cjs.js')
        const t1 = performance.now()

        const t2 = performance.now()
        const esm: any = await import('../../dist/index.esm.js')
        const t3 = performance.now()

        const cjsMs = (t1 - t0).toFixed(2)
        const esmMs = (t3 - t2).toFixed(2)

        console.log('LOAD CJS ms:', cjsMs)
        console.log('LOAD ESM ms:', esmMs)

        expect(cjs).toBeDefined()
        expect(esm).toBeDefined()
    })
})
