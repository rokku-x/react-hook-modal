import { describe, it, expect, beforeEach, vi } from 'vitest'
import '@testing-library/jest-dom'
import { render, screen, renderHook, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BaseModalRenderer from '../BaseModalRenderer'
import { RenderMode, useBaseModalInternal } from '@/hooks/useBaseModal'
import useStaticModal from '@/hooks/useStaticModal'

const makeRendererId = () => `renderer-${Math.random().toString(36).slice(2, 8)}`

// Test component that uses BaseModalRenderer and useStaticModal
function TestComponent({ rendererId }: { rendererId?: string }) {
    const [showModal, closeModal] = useStaticModal({ rendererId })

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
            <BaseModalRenderer id={rendererId} renderMode={RenderMode.STACKED} />
        </div>
    )
}

describe('BaseModalRenderer', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        document.body.className = ''
        document.body.removeAttribute('inert')
    })

    it('should render without crashing', () => {
        render(
            <div>
                <BaseModalRenderer id={makeRendererId()} />
            </div>
        )
    })

    it('should accept renderMode prop', () => {
        const { container } = render(
            <div>
                <BaseModalRenderer id={makeRendererId()} renderMode={RenderMode.STACKED} />
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

    it('should accept custom className and style props on wrapper dialog', async () => {
        const rendererId = makeRendererId()

        function WrapperDialogTest() {
            const [showModal] = useStaticModal({ rendererId })

            return (
                <div>
                    <button onClick={() => showModal(<div data-testid="modal-content">Modal</div>, 'modal-1')}>Open</button>
                    <BaseModalRenderer id={rendererId} className="custom-wrapper" style={{ padding: '20px' }} />
                </div>
            )
        }

        render(<WrapperDialogTest />)
        await userEvent.click(screen.getByText('Open'))

        const dialog = document.body.querySelector('dialog.renderer-wrapper') as HTMLDialogElement
        expect(dialog).toBeTruthy()
        expect(dialog).toHaveClass('renderer-wrapper custom-wrapper')
        expect(dialog).toHaveStyle({ padding: '20px' })
    })

    it('should apply custom window className and style for modal windows', async () => {
        const rendererId = makeRendererId()

        function WindowStyleTest() {
            const [showModal] = useStaticModal({ rendererId })

            return (
                <div>
                    <button onClick={() => showModal(<div data-testid="window-modal">Modal</div>, 'window-modal')}>Open</button>
                    <BaseModalRenderer id={rendererId} windowClassName="custom-window" windowStyle={{ backgroundColor: 'white' }} />
                </div>
            )
        }

        render(<WindowStyleTest />)
        await userEvent.click(screen.getByText('Open'))

        const window = screen.getByTestId('window-modal').closest('.custom-window') as HTMLElement
        expect(window).toBeTruthy()
        expect(window.style.backgroundColor).toBe('white')
    })

    it('should preserve body scroll when disableBackgroundScroll is false', async () => {
        const rendererId = makeRendererId()

        function NoScrollTest() {
            const [showModal] = useStaticModal({ rendererId })

            return (
                <div>
                    <button onClick={() => showModal(<div data-testid="no-scroll-modal">Modal</div>, 'no-scroll-modal')}>Open</button>
                    <BaseModalRenderer id={rendererId} disableBackgroundScroll={false} />
                </div>
            )
        }

        render(<NoScrollTest />)
        await userEvent.click(screen.getByText('Open'))

        expect(document.body.classList.contains('hook-modal-open')).toBe(false)
    })

    it('should render modals in STACKED mode', async () => {
        const rendererId = makeRendererId()
        render(<TestComponent rendererId={rendererId} />)

        const openButton = screen.getByText('Open Modal')
        await userEvent.click(openButton)

        expect(screen.getByTestId('modal-content')).toBeTruthy()
    })

    it('should render only the active modal in CURRENT_ONLY mode', async () => {
        const rendererId = makeRendererId()

        function CurrentOnlyTest() {
            const [showModal] = useStaticModal({ rendererId })

            return (
                <div>
                    <button onClick={() => showModal(<div data-testid="modal-1">Modal 1</div>, 'modal-1')}>Open Modal 1</button>
                    <button onClick={() => showModal(<div data-testid="modal-2">Modal 2</div>, 'modal-2')}>Open Modal 2</button>
                    <BaseModalRenderer id={rendererId} renderMode={RenderMode.CURRENT_ONLY} />
                </div>
            )
        }

        render(<CurrentOnlyTest />)

        await userEvent.click(screen.getByText('Open Modal 1'))
        expect(screen.getByTestId('modal-1')).toBeTruthy()

        await userEvent.click(screen.getByText('Open Modal 2'))
        expect(screen.getByTestId('modal-2')).toBeTruthy()
        expect(screen.queryByTestId('modal-1')).toBeNull()
    })

    it('should render hidden stack entries in CURRENT_HIDDEN_STACK mode', async () => {
        const rendererId = makeRendererId()

        function HiddenStackTest() {
            const [showModal] = useStaticModal({ rendererId })

            return (
                <div>
                    <button onClick={() => showModal(<div data-testid="modal-1">Modal 1</div>, 'modal-1')}>Open Modal 1</button>
                    <button onClick={() => showModal(<div data-testid="modal-2">Modal 2</div>, 'modal-2')}>Open Modal 2</button>
                    <BaseModalRenderer id={rendererId} renderMode={RenderMode.CURRENT_HIDDEN_STACK} />
                </div>
            )
        }

        render(<HiddenStackTest />)

        await userEvent.click(screen.getByText('Open Modal 1'))
        await userEvent.click(screen.getByText('Open Modal 2'))

        expect(screen.getByTestId('modal-1')).toBeTruthy()
        expect(screen.getByTestId('modal-2')).toBeTruthy()

        const modal1 = screen.getByTestId('modal-1').closest('.modal-window') as HTMLElement
        const modal2 = screen.getByTestId('modal-2').closest('.modal-window') as HTMLElement

        expect(modal1).toHaveAttribute('aria-hidden', 'true')
        expect(modal2).toHaveAttribute('aria-hidden', 'false')
    })

    it('should handle custom window styling', () => {
        render(
            <div>
                <BaseModalRenderer
                    id={makeRendererId()}
                    windowClassName="modal-window-custom"
                    windowStyle={{ borderRadius: '12px' }}
                />
            </div>
        )
    })

    it('should allow multiple renderers with different ids', () => {
        render(
            <div>
                <BaseModalRenderer id="renderer-1" />
                <BaseModalRenderer id="renderer-2" />
            </div>
        )
    })

    it('should throw when mounting duplicate ids', () => {
        expect(() => {
            render(
                <div>
                    <BaseModalRenderer id="renderer-1" />
                    <BaseModalRenderer id="renderer-1" />
                </div>
            )
        }).toThrow()
    })

    it('should isolate stores by renderer id', () => {
        render(<div><BaseModalRenderer id="r1" /><BaseModalRenderer id="r2" /></div>)
        const { result: r1 } = renderHook(() => useBaseModalInternal({ rendererId: 'r1' }))
        const { result: r2 } = renderHook(() => useBaseModalInternal({ rendererId: 'r2' }))
        act(() => {
            r1.current.store.getState().actions.pushModal('m1', '<div />', false)
        })
        expect(r1.current.currentModalId).toBe('m1')
        expect(r2.current.currentModalId).toBeUndefined()
    })

    it('should handle responsive props', () => {
        const { container } = render(
            <div>
                <BaseModalRenderer
                    id={makeRendererId()}
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
                <BaseModalRenderer id={makeRendererId()} />
            </div>
        )

        expect(container).toBeTruthy()
    })

    it('should handle all render modes', () => {
        const modes = [RenderMode.STACKED, RenderMode.CURRENT_ONLY, RenderMode.CURRENT_HIDDEN_STACK]

        for (const mode of modes) {
            const { container, unmount } = render(
                <div>
                    <BaseModalRenderer id={makeRendererId()} renderMode={mode} />
                </div>
            )

            expect(container).toBeTruthy()
            unmount()
        }
    })

    it('should support inert attribute application when a modal is opened', async () => {
        const rendererId = makeRendererId()

        function InertTest() {
            const [showModal] = useStaticModal({ rendererId })

            return (
                <div>
                    <button onClick={() => showModal(<div data-testid="inert-modal">Modal</div>, 'inert-modal')}>Open</button>
                    <BaseModalRenderer id={rendererId} />
                </div>
            )
        }

        render(<InertTest />)
        await userEvent.click(screen.getByText('Open'))

        expect(document.body.hasAttribute('inert')).toBe(true)
    })

    it('should accept combined styling props', () => {
        render(
            <div>
                <BaseModalRenderer
                    id={makeRendererId()}
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
