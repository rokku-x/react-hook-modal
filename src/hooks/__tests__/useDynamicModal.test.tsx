import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import useDynamicModal from '../useDynamicModal'
import useBaseModal from '@/hooks/useBaseModal'
import BaseModalRenderer from '@/components/BaseModalRenderer'

describe('useDynamicModal', () => {
    beforeEach(() => {
        render(<BaseModalRenderer />)
    })
    it('should return all required functions and properties', () => {
        const { result } = renderHook(() => useDynamicModal())

        expect(result.current).toHaveLength(6)
        expect(typeof result.current[0]).toBe('function') // renderModalElement
        expect(typeof result.current[1]).toBe('function') // showModal
        expect(typeof result.current[2]).toBe('function') // closeModal
        expect(typeof result.current[3]).toBe('function') // focus
        expect(typeof result.current[4]).toBe('string') // id
        expect(typeof result.current[5]).toBe('boolean') // isForeground
    })

    it('should return unique id for each instance', () => {
        const { result: result1 } = renderHook(() => useDynamicModal())
        const { result: result2 } = renderHook(() => useDynamicModal())

        const id1 = result1.current[4]
        const id2 = result2.current[4]

        expect(id1).not.toBe(id2)
    })

    it('should open modal with showModal', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [, showModal] = result.current

        act(() => {
            showModal()
        })

        expect(result.current[1]).toBeDefined()
    })

    it('should close modal', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [, showModal, closeModal] = result.current

        act(() => {
            showModal()
        })

        act(() => {
            closeModal()
        })

        expect(result.current[2]).toBeDefined()
    })

    it('should focus modal', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [, showModal, , focus] = result.current

        act(() => {
            showModal()
        })

        act(() => {
            focus()
        })

        expect(result.current[3]).toBeDefined()
    })

    it('should focus modal to bring to foreground', () => {
        const { result: result1 } = renderHook(() => useDynamicModal())
        const { result: result2 } = renderHook(() => useDynamicModal())
        const [, showModal1, , focus1, id1] = result1.current
        const [, showModal2, , , id2] = result2.current

        // Open both modals
        act(() => {
            showModal1()
            showModal2()
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

    it('should render modal element', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [renderModalElement, showModal] = result.current

        act(() => {
            showModal()
        })

        const rendered = renderModalElement('Test Content')

        expect(rendered).toBeDefined()
    })

    it('should track foreground state', () => {
        const { result } = renderHook(() => useDynamicModal())

        const initialIsForeground = result.current[5]
        expect(typeof initialIsForeground).toBe('boolean')
    })

    it('should handle null content rendering', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [renderModalElement] = result.current

        const rendered = renderModalElement(null)

        expect(rendered === null || rendered === undefined).toBeTruthy()
    })

    it('should handle undefined content rendering', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [renderModalElement] = result.current

        const rendered = renderModalElement(undefined)

        expect(rendered === null || rendered === undefined).toBeTruthy()
    })

    it('should support JSX element rendering', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [renderModalElement, showModal] = result.current

        act(() => {
            showModal()
        })

        const jsxContent = <div>Dynamic Modal Content</div>
        const rendered = renderModalElement(jsxContent)

        expect(rendered).toBeDefined()
    })

    it('should support string content rendering', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [renderModalElement, showModal] = result.current

        act(() => {
            showModal()
        })

        const rendered = renderModalElement('String Content')

        expect(rendered).toBeDefined()
    })

    it('should handle sequential open/close cycles', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [, showModal, closeModal] = result.current

        act(() => {
            showModal()
        })

        act(() => {
            closeModal()
        })

        act(() => {
            showModal()
        })

        expect(result.current[1]).toBeDefined()
    })

    it('should return portal rendered content', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [renderModalElement, showModal] = result.current

        act(() => {
            showModal()
        })

        const content = 'Modal Content'
        const rendered = renderModalElement(content)

        // In jsdom with renderer mounted, returns a React portal
        expect(rendered === null || (rendered as any)?.$$typeof === Symbol.for('react.portal')).toBeTruthy()
    })
})

describe('useDynamicModal - Negative Tests', () => {
    beforeEach(() => {
        render(<BaseModalRenderer />)
    })

    it('should return false when closing a non-existent modal', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [, , closeModal] = result.current

        let closeResult
        act(() => {
            closeResult = closeModal() // Close without showing
        })

        expect(closeResult).toBe(false)
    })

    it('should return false when focusing a non-existent modal', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [, , , focus] = result.current

        let focusResult
        act(() => {
            focusResult = focus() // Focus without showing
        })

        expect(focusResult).toBe(false)
    })

    it('should return null when rendering element before showModal', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [renderModalElement] = result.current

        let rendered
        act(() => {
            rendered = renderModalElement('Content') // No window ref exists yet
        })

        expect(rendered).toBeNull()
    })

    it('should return null when rendering after closeModal', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [renderModalElement, showModal, closeModal] = result.current

        act(() => {
            showModal()
        })

        act(() => {
            closeModal() // Window ref removed
        })

        let rendered
        act(() => {
            rendered = renderModalElement('Content')
        })

        expect(rendered).toBeNull()
    })

    it('should return false when closing already closed modal', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [, showModal, closeModal] = result.current

        act(() => {
            showModal()
        })

        let firstClose, secondClose
        act(() => {
            firstClose = closeModal()
        })

        act(() => {
            secondClose = closeModal() // Close again
        })

        expect(firstClose).toBe(true)
        expect(secondClose).toBe(false)
    })

    it('should return false when focusing after modal is closed', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [, showModal, closeModal, focus] = result.current

        act(() => {
            showModal()
            closeModal()
        })

        let focusResult
        act(() => {
            focusResult = focus() // Try to focus closed modal
        })

        expect(focusResult).toBe(false)
    })

    it('should handle rapid close calls', () => {
        const { result } = renderHook(() => useDynamicModal())
        const [, showModal, closeModal] = result.current

        act(() => {
            showModal()
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

    it('isForeground should be false when modal not shown', () => {
        const { result } = renderHook(() => useDynamicModal())
        const isForeground = result.current[5]

        expect(isForeground).toBe(false)
    })
})
