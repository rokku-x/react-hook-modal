import { describe, it, expect } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import { createElement } from 'react'
import BaseModalRenderer from '@/components/BaseModalRenderer'
import useBaseModal, { useBaseModalInternal, RenderMode } from '@/hooks/useBaseModal'
import useStaticModal from '@/hooks/useStaticModal'
import useDynamicModal from '@/hooks/useDynamicModal'

describe('Performance Benchmarks', () => {
    it('measures push/pop/update/focus and dynamic portal render', () => {
        // Reset store
        const { result: internal } = renderHook(() => useBaseModalInternal())
        act(() => {
            internal.current.store.setState({
                modalStackMap: new Map(),
                currentModalId: undefined,
                isMounted: false,
                modalWindowRefs: undefined,
                renderMode: RenderMode.STACKED,
            } as any)
        })
        render(createElement(BaseModalRenderer))

        const { result: base } = renderHook(() => useBaseModal())

        // push/pop 1000 cycles
        const cycles = 1000
        const t0 = performance.now()
        act(() => {
            for (let i = 0; i < cycles; i++) {
                base.current.pushModal('bench', 'content')
                base.current.popModal('bench')
            }
        })
        const t1 = performance.now()

        // update 1000 cycles
        act(() => {
            base.current.pushModal('bench-update', 'content')
        })
        const t2 = performance.now()
        act(() => {
            for (let i = 0; i < cycles; i++) {
                base.current.updateModal('bench-update', 'c' + i)
            }
        })
        const t3 = performance.now()

        // focus 5000 toggles
        act(() => {
            base.current.pushModal('bench-a', 'A')
            base.current.pushModal('bench-b', 'B')
        })
        const t4 = performance.now()
        act(() => {
            for (let i = 0; i < 5000; i++) {
                base.current.focusModal('bench-a')
                base.current.focusModal('bench-b')
            }
        })
        const t5 = performance.now()

        // dynamic portal render 1000 times
        const { result: dyn } = renderHook(() => useDynamicModal())
        const [renderPortal, showDyn] = dyn.current
        act(() => {
            showDyn()
        })
        const t6 = performance.now()
        act(() => {
            for (let i = 0; i < cycles; i++) {
                renderPortal('x')
            }
        })
        const t7 = performance.now()

        const pushPopPer = ((t1 - t0) / cycles) * 1000 // microseconds
        const updatePer = ((t3 - t2) / cycles) * 1000
        const focusPer = ((t5 - t4) / 10000) * 1000 // two ops per loop
        const portalPer = ((t7 - t6) / cycles) * 1000

        // Log results for README capture
        console.log('PERF push/pop µs/op:', pushPopPer.toFixed(2))
        console.log('PERF update µs/op:', updatePer.toFixed(2))
        console.log('PERF focus µs/op:', focusPer.toFixed(2))
        console.log('PERF portal render µs/op:', portalPer.toFixed(2))

        // Basic sanity expectations
        expect(pushPopPer).toBeGreaterThan(0)
        expect(updatePer).toBeGreaterThan(0)
        expect(focusPer).toBeGreaterThan(0)
        expect(portalPer).toBeGreaterThan(0)
    })
})
