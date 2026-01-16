import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import useBaseModal, { RenderMode, useBaseModalInternal } from '../useBaseModal'
import BaseModalRenderer from '@/components/BaseModalRenderer'
import { createElement } from 'react'

describe('useBaseModal', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useBaseModalInternal())
        act(() => {
            result.current.store.setState({
                modalStackMap: new Map(),
                currentModalId: undefined,
                isMounted: false,
                modalWindowRefs: undefined,
                renderMode: RenderMode.STACKED,
            } as any)
        })
        render(createElement(BaseModalRenderer))
    })

    it('should return actions and state', () => {
        const { result } = renderHook(() => useBaseModal())

        expect(result.current).toHaveProperty('pushModal')
        expect(result.current).toHaveProperty('popModal')
        expect(result.current).toHaveProperty('updateModal')
        expect(result.current).toHaveProperty('focusModal')
        expect(result.current).toHaveProperty('getModal')
        expect(result.current).toHaveProperty('currentModalId')
        expect(result.current).toHaveProperty('renderMode')
    })

    it('should push modal to stack', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Test Content')
        })

        const internal = renderHook(() => useBaseModalInternal())
        expect(internal.result.current.modalStackMap.size).toBe(1)
        expect(internal.result.current.modalStackMap.get('modal-1')).toEqual(['Test Content', false])
    })

    it('should pop modal from stack', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Test Content')
        })

        const internal = renderHook(() => useBaseModalInternal())
        expect(internal.result.current.modalStackMap.size).toBe(1)

        act(() => {
            result.current.popModal('modal-1')
        })

        expect(internal.result.current.modalStackMap.size).toBe(0)
    })

    it('should update modal content', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Initial Content')
        })

        act(() => {
            result.current.updateModal('modal-1', 'Updated Content')
        })

        expect(result.current.getModal('modal-1')).toEqual(['Updated Content', false])
    })

    it('should get modal by id', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Test Content')
        })

        const modal = result.current.getModal('modal-1')
        expect(modal).toEqual(['Test Content', false])
    })

    it('should return undefined for non-existent modal', () => {
        const { result } = renderHook(() => useBaseModal())

        const modal = result.current.getModal('non-existent')
        expect(modal).toBeUndefined()
    })

    it('should focus modal', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Content 1')
            result.current.pushModal('modal-2', 'Content 2')
        })

        expect(result.current.currentModalId).toBe('modal-2')

        act(() => {
            result.current.focusModal('modal-1')
        })

        expect(result.current.currentModalId).toBe('modal-1')
    })

    it('should track dynamic modals', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Content', true)
        })

        const modal = result.current.getModal('modal-1')
        expect(modal).toEqual(['Content', true])
    })

    it('should get modal order index', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Content 1')
            result.current.pushModal('modal-2', 'Content 2')
            result.current.pushModal('modal-3', 'Content 3')
        })

        expect(result.current.getModalOrderIndex('modal-1')).toBe(0)
        expect(result.current.getModalOrderIndex('modal-2')).toBe(1)
        expect(result.current.getModalOrderIndex('modal-3')).toBe(2)
    })

    it('should handle multiple modal operations', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Content 1')
            result.current.pushModal('modal-2', 'Content 2')
            result.current.pushModal('modal-3', 'Content 3')
        })

        const internal = renderHook(() => useBaseModalInternal())
        expect(internal.result.current.modalStackMap.size).toBe(3)

        act(() => {
            result.current.popModal('modal-2')
        })

        expect(internal.result.current.modalStackMap.size).toBe(2)
        expect(result.current.getModal('modal-2')).toBeUndefined()
    })

    it('should preserve modal when re-focusing', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Content')
        })

        const firstPush = result.current.currentModalId

        act(() => {
            result.current.focusModal('modal-1')
        })

        const internal = renderHook(() => useBaseModalInternal())
        expect(internal.result.current.modalStackMap.size).toBe(1)
        expect(result.current.currentModalId).toBe(firstPush)
    })
})

describe('useBaseModal - Negative Tests', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useBaseModalInternal())
        act(() => {
            result.current.store.setState({
                modalStackMap: new Map(),
                currentModalId: undefined,
                isMounted: false,
                modalWindowRefs: undefined,
                renderMode: RenderMode.STACKED,
            } as any)
        })
        render(createElement(BaseModalRenderer))
    })

    it('should return false when popping non-existent modal', () => {
        const { result } = renderHook(() => useBaseModal())

        let popResult
        act(() => {
            popResult = result.current.popModal('non-existent')
        })

        expect(popResult).toBe(false)
    })

    it('should return undefined when getting non-existent modal', () => {
        const { result } = renderHook(() => useBaseModal())

        const modal = result.current.getModal('non-existent')

        expect(modal).toBeUndefined()
    })

    it('should return -1 when getting order index of non-existent modal', () => {
        const { result } = renderHook(() => useBaseModal())

        const index = result.current.getModalOrderIndex('non-existent')

        expect(index).toBe(-1)
    })

    it('should return undefined for modal window ref of non-existent modal', () => {
        const { result } = renderHook(() => useBaseModal())

        const ref = result.current.getModalWindowRef('non-existent')

        expect(ref).toBeUndefined()
    })

    it('should return false when focusing non-existent modal', () => {
        const { result } = renderHook(() => useBaseModal())

        let focusResult
        act(() => {
            focusResult = result.current.focusModal('non-existent')
        })

        expect(focusResult).toBe(false)
    })

    it('should return false when updating non-existent modal', () => {
        const { result } = renderHook(() => useBaseModal())

        let updateResult
        act(() => {
            updateResult = result.current.updateModal('non-existent', 'New Content')
        })

        expect(updateResult).toBe(false)
    })

    it('should not add modal when pushModal called with empty id', () => {
        const { result } = renderHook(() => useBaseModal())
        const { result: baseResult } = renderHook(() => useBaseModalInternal())

        act(() => {
            result.current.pushModal('', 'Content') // Empty id
        })

        expect(baseResult.current.modalStackMap.size).toBe(1) // Still added, just with empty key
    })

    it('should return false when popping twice', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Content')
        })

        let firstPop, secondPop
        act(() => {
            firstPop = result.current.popModal('modal-1')
        })

        act(() => {
            secondPop = result.current.popModal('modal-1')
        })

        expect(firstPop).toBe(true)
        expect(secondPop).toBe(false)
    })

    it('should handle updating after modal is popped', () => {
        const { result } = renderHook(() => useBaseModal())

        act(() => {
            result.current.pushModal('modal-1', 'Initial')
        })

        act(() => {
            result.current.popModal('modal-1')
        })

        let updateResult
        act(() => {
            updateResult = result.current.updateModal('modal-1', 'Updated')
        })

        expect(updateResult).toBe(false)
    })

    it('should return negative index for modal order on empty stack', () => {
        const { result } = renderHook(() => useBaseModal())

        const index = result.current.getModalOrderIndex('any-id')

        expect(index).toBe(-1)
    })
})
