import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, render } from '@testing-library/react'
import useStaticModal from '@/hooks/useStaticModal'
import useBaseModal, { useBaseModalInternal } from '@/hooks/useBaseModal'
import useDynamicModal from '@/hooks/useDynamicModal'
import { RenderMode } from '@/hooks/useBaseModal'
import BaseModalRenderer from '@/components/BaseModalRenderer'
import { createElement } from 'react'

describe('Integration Tests - Modal Hooks', () => {
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
        // Mount BaseModalRenderer after resetting the store so isMounted is true
        render(createElement(BaseModalRenderer))
    })
    describe('Static and Base Modal Integration', () => {
        it('should work together correctly', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: staticResult } = renderHook(() => useStaticModal())

            const [showModal, closeModal, , , id] = staticResult.current

            act(() => {
                showModal('Test Content')
            })

            expect(baseResult.current.modalStackMap.size).toBe(1)
            expect(baseResult.current.modalStackMap.get(id)).toBeDefined()
        })

        it('should support multiple static modals', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: static1 } = renderHook(() => useStaticModal())
            const { result: static2 } = renderHook(() => useStaticModal())

            act(() => {
                static1.current[0]('Modal 1')
                static2.current[0]('Modal 2')
            })

            expect(baseResult.current.modalStackMap.size).toBe(2)
        })

        it('should handle default content and custom content', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: staticDefault } = renderHook(() => useStaticModal('Default Content'))
            const { result: staticCustom } = renderHook(() => useStaticModal())

            act(() => {
                staticDefault.current[0]() // Use default
                staticCustom.current[0]('Custom Content')
            })

            expect(baseResult.current.modalStackMap.size).toBe(2)
        })

        it('should update modal content correctly', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: staticResult } = renderHook(() => useStaticModal())

            const [showModal, , , updateModalContent] = staticResult.current

            act(() => {
                showModal('Initial Content')
            })

            const initialContent = Array.from(baseResult.current.modalStackMap.values())[0][0]

            act(() => {
                updateModalContent('Updated Content')
            })

            const updatedContent = Array.from(baseResult.current.modalStackMap.values())[0][0]

            expect(initialContent).not.toBe(updatedContent)
        })

        it('should close modals correctly', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: staticResult } = renderHook(() => useStaticModal())

            const [showModal, closeModal] = staticResult.current

            act(() => {
                showModal('Content')
            })

            expect(baseResult.current.modalStackMap.size).toBe(1)

            act(() => {
                closeModal()
            })

            expect(baseResult.current.modalStackMap.size).toBe(0)
        })
    })

    describe('Dynamic and Base Modal Integration', () => {
        it('should work together correctly', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: dynamicResult } = renderHook(() => useDynamicModal())

            const [, showModal] = dynamicResult.current

            act(() => {
                showModal()
            })

            expect(baseResult.current.modalStackMap.size).toBe(1)
        })

        it('should track dynamic modal state', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: dynamicResult } = renderHook(() => useDynamicModal())

            const [, showModal, , , id] = dynamicResult.current

            act(() => {
                showModal()
            })

            const { result: actions } = renderHook(() => useBaseModal())
            const modal = actions.current.getModal(id)
            expect(modal?.[1]).toBe(true) // isDynamic flag should be true
        })

        it('should support focusing dynamic modals', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: dynamic1 } = renderHook(() => useDynamicModal())
            const { result: dynamic2 } = renderHook(() => useDynamicModal())

            act(() => {
                dynamic1.current[1]() // showModal
                dynamic2.current[1]() // showModal
            })

            expect(baseResult.current.currentModalId).toBe(dynamic2.current[4])

            act(() => {
                dynamic1.current[3]() // focus
            })

            expect(baseResult.current.currentModalId).toBe(dynamic1.current[4])
        })
    })

    describe('Mixed Static and Dynamic Modals', () => {
        it('should handle both static and dynamic modals together', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: staticResult } = renderHook(() => useStaticModal())
            const { result: dynamicResult } = renderHook(() => useDynamicModal())

            act(() => {
                staticResult.current[0]('Static Content')
                dynamicResult.current[1]() // showModal
            })

            expect(baseResult.current.modalStackMap.size).toBe(2)
        })

        it('should maintain correct modal order with mixed types', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: static1 } = renderHook(() => useStaticModal())
            const { result: dynamic1 } = renderHook(() => useDynamicModal())
            const { result: static2 } = renderHook(() => useStaticModal())

            act(() => {
                static1.current[0]('Static 1')
                dynamic1.current[1]()
                static2.current[0]('Static 2')
            })

            expect(baseResult.current.modalStackMap.size).toBe(3)
        })

        it('should close individual modals from mixed stack', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: static1 } = renderHook(() => useStaticModal())
            const { result: dynamic1 } = renderHook(() => useDynamicModal())

            act(() => {
                static1.current[0]('Static Content')
                dynamic1.current[1]()
            })

            expect(baseResult.current.modalStackMap.size).toBe(2)

            act(() => {
                dynamic1.current[2]() // closeModal
            })

            expect(baseResult.current.modalStackMap.size).toBe(1)
            expect(baseResult.current.currentModalId).toBe(static1.current[4])
        })
    })

    describe('Complex Scenarios', () => {
        it('should handle rapid open/close cycles', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: staticResult } = renderHook(() => useStaticModal())

            const [showModal, closeModal] = staticResult.current

            act(() => {
                for (let i = 0; i < 5; i++) {
                    showModal(`Content ${i}`)
                    closeModal()
                }
            })

            expect(baseResult.current.modalStackMap.size).toBe(0)
        })

        it('should handle stacked modals with updates', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: static1 } = renderHook(() => useStaticModal('Default 1'))
            const { result: static2 } = renderHook(() => useStaticModal())

            act(() => {
                static1.current[0]()
                static2.current[0]('Modal 2')
            })

            expect(baseResult.current.modalStackMap.size).toBe(2)

            act(() => {
                static1.current[3]('Updated Modal 1') // updateModalContent
            })

            expect(baseResult.current.modalStackMap.size).toBe(2)
        })

        it('should maintain state during navigation between modals', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: static1 } = renderHook(() => useStaticModal())
            const { result: static2 } = renderHook(() => useStaticModal())

            act(() => {
                static1.current[0]('Modal 1')
                static2.current[0]('Modal 2')
            })

            const id1 = static1.current[4]
            const id2 = static2.current[4]

            const { result: actionsResult } = renderHook(() => useBaseModal())
            act(() => {
                actionsResult.current.focusModal(id1)
            })

            expect(baseResult.current.currentModalId).toBe(id1)

            act(() => {
                actionsResult.current.focusModal(id2)
            })

            expect(baseResult.current.currentModalId).toBe(id2)
        })

        it('should handle render mode switching with modals open', () => {
            const { result: baseResult } = renderHook(() => useBaseModalInternal())
            const { result: staticResult } = renderHook(() => useStaticModal())

            act(() => {
                staticResult.current[0]('Content')
            })

            act(() => {
                baseResult.current.setRenderMode(RenderMode.CURRENT_ONLY)
            })

            expect(baseResult.current.renderMode).toBe(RenderMode.CURRENT_ONLY)
            expect(baseResult.current.modalStackMap.size).toBe(1)
        })
    })
})
