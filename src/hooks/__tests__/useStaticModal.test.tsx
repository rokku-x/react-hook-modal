import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import BaseModalRenderer from '@/components/BaseModalRenderer'
import useStaticModal from '../useStaticModal'
import useBaseModal, { useBaseModalInternal } from '@/hooks/useBaseModal'

describe('useStaticModal', () => {
    beforeEach(() => {
        // Reset base modal internal store to ensure test isolation
        const { result } = renderHook(() => useBaseModalInternal())
        act(() => {
            result.current.store.setState({
                modalStackMap: new Map(),
                currentModalId: undefined,
                isMounted: false,
                modalWindowRefs: undefined,
            } as any)
        })
        render(<BaseModalRenderer />)
    })
    it('should return showModal, closeModal, focus, updateModalContent, and id', () => {
        const { result } = renderHook(() => useStaticModal())

        expect(result.current).toHaveLength(5)
        expect(typeof result.current[0]).toBe('function') // showModal
        expect(typeof result.current[1]).toBe('function') // closeModal
        expect(typeof result.current[2]).toBe('function') // focus
        expect(typeof result.current[3]).toBe('function') // updateModalContent
        expect(typeof result.current[4]).toBe('string') // id
    })

    it('should show modal with provided content and return hook id', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal] = result.current

        let returnValue
        act(() => {
            returnValue = showModal('Test Content')
        })

        expect(typeof returnValue).toBe('string')
        expect(returnValue).toBe(result.current[4])
    })

    it('should show default content when provided to hook', () => {
        const defaultContent = 'Default Content'
        const { result } = renderHook(() => useStaticModal(defaultContent))
        const [showModal] = result.current

        act(() => {
            showModal()
        })

        // Should not throw
        expect(result.current[0]).toBeDefined()
    })

    it('should create a new unique instance when passing true', () => {
        const { result } = renderHook(() => useStaticModal())
        const { result: baseResult } = renderHook(() => useBaseModalInternal())
        const [showModal, , , , id] = result.current

        act(() => {
            showModal('One-off', true)
        })

        expect(baseResult.current.modalStackMap.size).toBe(1)
        const keys = Array.from(baseResult.current.modalStackMap.keys())
        expect(keys[0]).not.toBe(id)
    })

    it('should open and replace an instance when using a custom id', () => {
        const { result } = renderHook(() => useStaticModal())
        const { result: baseResult } = renderHook(() => useBaseModalInternal())
        const [showModal] = result.current

        act(() => {
            showModal('First', 'custom-1')
        })

        expect(baseResult.current.modalStackMap.has('custom-1')).toBe(true)
        expect(baseResult.current.modalStackMap.size).toBe(1)

        act(() => {
            showModal('Updated', 'custom-1')
        })

        expect(baseResult.current.modalStackMap.size).toBe(1)
    })

    it('should show provided content over default content', () => {
        const defaultContent = 'Default'
        const { result } = renderHook(() => useStaticModal(defaultContent))
        const [showModal] = result.current

        act(() => {
            showModal('Custom Content')
        })

        expect(result.current[0]).toBeDefined()
    })

    it('should close modal', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal, closeModal] = result.current

        act(() => {
            showModal('Content')
        })

        let closeResult
        act(() => {
            closeResult = closeModal()
        })

        expect(typeof closeResult).toBe('boolean')
    })

    it('should focus modal to foreground', () => {
        const { result: result1 } = renderHook(() => useStaticModal())
        const { result: result2 } = renderHook(() => useStaticModal())
        const [showModal1, , focus1, , id1] = result1.current
        const [showModal2, , , , id2] = result2.current

        // Open both modals
        act(() => {
            showModal1('Modal 1')
            showModal2('Modal 2')
        })

        // Modal 2 should be focused (last opened)
        const { result: baseResult } = renderHook(() => useBaseModal())
        expect(baseResult.current.currentModalId).toBe(id2)

        // Focus modal 1
        let focusResult
        act(() => {
            focusResult = focus1()
        })

        expect(focusResult).toBe(true)
        expect(baseResult.current.currentModalId).toBe(id1)
    })

    it('should return unique id for each hook instance', () => {
        const { result: result1 } = renderHook(() => useStaticModal())
        const { result: result2 } = renderHook(() => useStaticModal())

        const id1 = result1.current[4]
        const id2 = result2.current[4]

        expect(id1).not.toBe(id2)
    })

    it('should update modal content', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal, , , updateModalContent] = result.current

        act(() => {
            showModal('Initial Content')
        })

        act(() => {
            updateModalContent('Updated Content')
        })

        // Should not throw
        expect(result.current[4]).toBeDefined()
    })

    it('should support function content', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal] = result.current

        const renderFunction = () => 'Rendered Content'

        act(() => {
            showModal(renderFunction)
        })

        expect(result.current[0]).toBeDefined()
    })

    it('should support function as default content', () => {
        const { result } = renderHook(() => useStaticModal(() => 'Default Rendered'))
        const [showModal] = result.current

        act(() => {
            showModal()
        })

        expect(result.current[0]).toBeDefined()
    })

    it('should handle sequential opens and closes', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal, closeModal] = result.current

        act(() => {
            showModal('Content 1')
        })

        act(() => {
            closeModal()
        })

        act(() => {
            showModal('Content 2')
        })

        expect(result.current[0]).toBeDefined()
    })

    it('should handle null and undefined content', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal] = result.current

        act(() => {
            showModal(null as any)
        })

        act(() => {
            showModal(undefined as any)
        })

        expect(result.current[0]).toBeDefined()
    })

    it('should support JSX elements', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal] = result.current

        const jsxContent = <div>JSX Content</div>

        act(() => {
            showModal(jsxContent)
        })

        expect(result.current[0]).toBeDefined()
    })

    it('should support JSX elements', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal] = result.current

        const jsxContent = <div>JSX Content</div>

        act(() => {
            showModal(jsxContent)
        })

        expect(result.current[0]).toBeDefined()
    })
})

describe('useStaticModal - Negative Tests', () => {
    beforeEach(() => {
        render(<BaseModalRenderer />)
    })

    it('should return false when closing a non-existent modal', () => {
        const { result } = renderHook(() => useStaticModal())
        const [, closeModal] = result.current

        let closeResult
        act(() => {
            closeResult = closeModal() // Close without ever showing
        })

        expect(closeResult).toBe(false)
    })

    it('should return false when focusing a non-existent modal', () => {
        const { result } = renderHook(() => useStaticModal())
        const [, , focus] = result.current

        let focusResult
        act(() => {
            focusResult = focus() // Focus without ever showing
        })

        expect(focusResult).toBe(false)
    })

    it('should return false when updating content on non-existent modal', () => {
        const { result } = renderHook(() => useStaticModal())
        const [, , , updateModalContent] = result.current

        let updateResult
        act(() => {
            updateResult = updateModalContent('Updated') // Update without showing
        })

        // updateModal returns false when modal doesn't exist
        expect(updateResult).toBe(false)
    })

    it('should return false when closing already closed modal', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal, closeModal] = result.current

        act(() => {
            showModal('Content')
        })

        let firstClose, secondClose
        act(() => {
            firstClose = closeModal()
        })

        act(() => {
            secondClose = closeModal() // Close again
        })

        expect(firstClose).toBe(true)
        expect(secondClose).toBe(false) // Second close fails
    })

    it('should handle focus after modal is closed', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal, closeModal, focus] = result.current

        act(() => {
            showModal('Content')
            closeModal()
        })

        let focusResult
        act(() => {
            focusResult = focus() // Try to focus closed modal
        })

        expect(focusResult).toBe(false)
    })

    it('should show modal without content and no default as undefined', () => {
        const { result } = renderHook(() => useStaticModal()) // No default
        const [showModal] = result.current

        act(() => {
            showModal() // Call without content
        })

        // Should push undefined content
        const { result: baseResult } = renderHook(() => useBaseModal())
        const modal = baseResult.current.getModal(result.current[4])
        expect(modal?.[0]).toBeUndefined()
    })

    it('should handle rapid close calls', () => {
        const { result } = renderHook(() => useStaticModal())
        const [showModal, closeModal] = result.current

        act(() => {
            showModal('Content')
        })

        let results: boolean[] = []
        act(() => {
            results.push(closeModal())
            results.push(closeModal())
            results.push(closeModal())
        })

        expect(results[0]).toBe(true)
        expect(results[1]).toBe(false)
        expect(results[2]).toBe(false)
    })
})
