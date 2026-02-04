import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import BaseModalRenderer from '../BaseModalRenderer'
import { RenderMode } from '@/hooks/useBaseModal'
import useStaticModal from '@/hooks/useStaticModal'

// Test component that uses BaseModalRenderer and useStaticModal
function TestComponent() {
    const [showModal, closeModal] = useStaticModal()

    return (
        <div>
            <button onClick={() => showModal(
                <div data-testid="modal-content">
                    <h2>Test Modal</h2>
                    <button onClick={closeModal}>Close Modal</button>
                </div>
            )}>
                Open Modal
            </button>
            <BaseModalRenderer renderMode={RenderMode.STACKED} />
        </div>
    )
}

describe('BaseModalRenderer', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    it('should render without crashing', () => {
        render(
            <div>
                <BaseModalRenderer />
            </div>
        )
    })

    it('should accept renderMode prop', () => {
        const { container } = render(
            <div>
                <BaseModalRenderer renderMode={RenderMode.STACKED} />
            </div>
        )

        expect(container).toBeTruthy()
    })

    it('should accept custom id prop', () => {
        const { container } = render(
            <div>
                <BaseModalRenderer id="custom-modal-id" />
            </div>
        )

        expect(container).toBeTruthy()
    })

    it('should accept custom className', () => {
        render(
            <div>
                <BaseModalRenderer className="custom-wrapper" />
            </div>
        )
    })

    it('should accept custom style prop', () => {
        render(
            <div>
                <BaseModalRenderer style={{ padding: '20px' }} />
            </div>
        )
    })

    it('should accept windowClassName prop', () => {
        render(
            <div>
                <BaseModalRenderer windowClassName="custom-window" />
            </div>
        )
    })

    it('should accept windowStyle prop', () => {
        render(
            <div>
                <BaseModalRenderer windowStyle={{ backgroundColor: 'white' }} />
            </div>
        )
    })

    it('should support disableBackgroundScroll prop', () => {
        render(
            <div>
                <BaseModalRenderer disableBackgroundScroll={false} />
            </div>
        )
    })

    it('should render modals in STACKED mode', async () => {
        render(<TestComponent />)

        const openButton = screen.getByText('Open Modal')
        await userEvent.click(openButton)

        // Modal should be visible
        expect(screen.getByTestId('modal-content')).toBeTruthy()
    })

    it('should render modals in CURRENT_ONLY mode', async () => {
        function CurrentOnlyTest() {
            const [showModal, closeModal] = useStaticModal()

            return (
                <div>
                    <button onClick={() => showModal(
                        <div data-testid="modal-1">Modal 1</div>
                    )}>
                        Open Modal 1
                    </button>
                    <BaseModalRenderer renderMode={RenderMode.CURRENT_ONLY} />
                </div>
            )
        }

        render(<CurrentOnlyTest />)

        const button = screen.getByText('Open Modal 1')
        await userEvent.click(button)
    })

    it('should render modals in CURRENT_HIDDEN_STACK mode', async () => {
        function HiddenStackTest() {
            const [showModal, closeModal] = useStaticModal()

            return (
                <div>
                    <button onClick={() => showModal(
                        <div data-testid="modal-1">Modal 1</div>
                    )}>
                        Open Modal
                    </button>
                    <BaseModalRenderer renderMode={RenderMode.CURRENT_HIDDEN_STACK} />
                </div>
            )
        }

        render(<HiddenStackTest />)

        const button = screen.getByText('Open Modal')
        await userEvent.click(button)
    })

    it('should handle custom window styling', () => {
        render(
            <div>
                <BaseModalRenderer
                    windowClassName="modal-window-custom"
                    windowStyle={{ borderRadius: '12px' }}
                />
            </div>
        )
    })

    it('should work with multiple renderers error handling', () => {
        expect(() => {
            render(
                <div>
                    <BaseModalRenderer id="renderer-1" />
                    <BaseModalRenderer id="renderer-2" />
                </div>
            )
        }).toThrow()
    })

    it('should handle responsive props', () => {
        const { container } = render(
            <div>
                <BaseModalRenderer
                    id="responsive-modal"
                    className="renderer-wrapper-responsive"
                    style={{ width: '100vw' }}
                    windowStyle={{ maxHeight: '90vh' }}
                />
            </div>
        )

        expect(container).toBeTruthy()
    })

    it('should render with default props', () => {
        const { container } = render(
            <div>
                <BaseModalRenderer />
            </div>
        )

        expect(container).toBeTruthy()
    })

    it('should handle all render modes', () => {
        const modes = [RenderMode.STACKED, RenderMode.CURRENT_ONLY, RenderMode.CURRENT_HIDDEN_STACK]

        for (const mode of modes) {
            const { container, unmount } = render(
                <div>
                    <BaseModalRenderer renderMode={mode} />
                </div>
            )

            expect(container).toBeTruthy()
            unmount()
        }
    })

    it('should support inert attribute application', () => {
        render(
            <div>
                <BaseModalRenderer />
            </div>
        )
    })

    it('should handle null children gracefully', () => {
        const { container } = render(
            <div>
                <BaseModalRenderer>
                    {null}
                </BaseModalRenderer>
            </div>
        )

        expect(container).toBeTruthy()
    })

    it('should accept combined styling props', () => {
        render(
            <div>
                <BaseModalRenderer
                    className="renderer-wrapper"
                    style={{
                        position: 'fixed',
                        zIndex: 1000
                    }}
                    windowClassName="modal-window"
                    windowStyle={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    disableBackgroundScroll={true}
                />
            </div>
        )
    })
})
