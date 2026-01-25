import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BaseModalRenderer from '@/components/BaseModalRenderer'
import { RenderMode, useBaseModalInternal } from '@/hooks/useBaseModal'
import useStaticModal from '@/hooks/useStaticModal'
import useDynamicModal from '@/hooks/useDynamicModal'
import { act, renderHook } from '@testing-library/react'

// Helpers to reset Zustand store and DOM between tests
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
    document.body.innerHTML = ''
    document.head.innerHTML = ''
})

// Example 1: Basic Static Modal
function BasicModalExample() {
    const [showModal, closeModal] = useStaticModal()
    return (
        <button onClick={() => showModal(
            <div>
                <h2>Welcome</h2>
                <p>This is a basic modal example.</p>
                <button onClick={closeModal}>Close</button>
            </div>
        )}>Show Modal</button>
    )
}

// Example 1b: Content in hook parameter
import { useEffect, useRef } from 'react'
function WelcomeModalParam() {
    const closeRef = useRef<() => boolean>(() => false)
    const content = (
        <div>
            <h2>Welcome</h2>
            <p>This modal content is defined in the hook parameter.</p>
            <button onClick={() => closeRef.current()}>Close</button>
        </div>
    )
    const [showModal, closeModal] = useStaticModal(content)
    useEffect(() => { closeRef.current = closeModal }, [closeModal])
    return <button onClick={() => showModal()}>Show Welcome Modal</button>
}

// Example 1c: Content in showModal call (two variants)
function DynamicContentModal() {
    const [showModal, closeModal] = useStaticModal()
    const showWelcome = () => {
        showModal(
            <div>
                <h2>Welcome</h2>
                <button onClick={closeModal}>Close</button>
            </div>
        )
    }
    const showGoodbye = () => {
        showModal(
            <div>
                <h2>Goodbye</h2>
                <button onClick={closeModal}>Close</button>
            </div>
        )
    }
    return (
        <>
            <button onClick={showWelcome}>Show Welcome</button>
            <button onClick={showGoodbye}>Show Goodbye</button>
        </>
    )
}

// Example 2: Confirmation Dialog
function ConfirmationExample() {
    const [showModal, closeModal] = useStaticModal()
    const handleDelete = () => {
        showModal(
            <div>
                <h2>Confirm Delete</h2>
                <p>Are you sure you want to delete this item?</p>
                <div>
                    <button onClick={closeModal}>Cancel</button>
                    <button onClick={() => { console.log('Deleted!'); closeModal(); }}>Delete</button>
                </div>
            </div>
        )
    }
    return <button onClick={handleDelete}>Delete Item</button>
}

// Example 3: Update Modal Content (wizard)
function UpdateableModalExample() {
    const [showModal, closeModal, , , updateModalContent] = useStaticModal()
    const renderStep = (stepNum: number) => (
        <div>
            <h2>Step {stepNum + 1} of 3</h2>
            <div>
                <button onClick={() => {
                    const newStep = stepNum - 1
                    if (newStep >= 0) updateModalContent(renderStep(newStep))
                }} disabled={stepNum === 0}>Previous</button>
                <button onClick={() => {
                    if (stepNum === 2) closeModal()
                    else updateModalContent(renderStep(stepNum + 1))
                }}>{stepNum === 2 ? 'Complete' : 'Next'}</button>
            </div>
        </div>
    )
    const openWizard = () => {
        showModal(renderStep(0))
    }
    return <button onClick={openWizard}>Open Wizard</button>
}

// Example 4: Dynamic Modal with Form
function FormModal() {
    const [renderModalElement, showModal, closeModal] = useDynamicModal()
    const { isMounted } = useBaseModalInternal()
    const onSubmit = (e: React.FormEvent) => { e.preventDefault(); console.log('Form submitted'); closeModal() }
    const modal = (
        <form onSubmit={onSubmit}>
            <h2>Contact Form</h2>
            <input placeholder="Name" />
            <input placeholder="Email" />
            <button type="submit">Submit</button>
            <button type="button" onClick={closeModal}>Cancel</button>
        </form>
    )
    return (
        <div>
            <button onClick={showModal}>Open Form</button>
            {isMounted ? renderModalElement(modal) : null}
        </div>
    )
}

// Example 5: Multiple Stacked Modals
function StackedModalsExample() {
    const [showModal1, closeModal1] = useStaticModal()
    const [showModal2, closeModal2] = useStaticModal()
    const openSecondModal = () => {
        showModal2(
            <div>
                <h2>Second Modal</h2>
                <button onClick={closeModal2}>Close This Modal</button>
            </div>
        )
    }
    const openFirstModal = () => {
        showModal1(
            <div>
                <h2>First Modal</h2>
                <button onClick={openSecondModal}>Open Another</button>
                <button onClick={closeModal1}>Close</button>
            </div>
        )
    }
    return <button onClick={openFirstModal}>Open Stacked Modals</button>
}

// Example 6: Custom Styling
function StyledModalExample() {
    const [showModal, closeModal] = useStaticModal()
    return (
        <>
            <button onClick={() => showModal(
                <div>
                    <h2>Styled Modal</h2>
                    <button onClick={closeModal}>Close</button>
                </div>
            )}>Show Styled Modal</button>
            <BaseModalRenderer
                windowClassName="custom-modal-window"
                windowStyle={{ backdropFilter: 'blur(5px)' }}
                className="custom-modal-wrapper"
            />
        </>
    )
}

describe('README Examples', () => {
    it('Example 1: Basic Static Modal shows and closes', async () => {
        render(<><BasicModalExample /><BaseModalRenderer /></>)
        await userEvent.click(screen.getByText('Show Modal'))
        expect(screen.getByText('Welcome')).toBeTruthy()
        await userEvent.click(screen.getByText('Close'))
        expect(screen.queryByText('Welcome')).toBeNull()
    })

    it('Example 1b: hook parameter content shows', async () => {
        render(<><WelcomeModalParam /><BaseModalRenderer /></>)
        await userEvent.click(screen.getByText('Show Welcome Modal'))
        expect(screen.getByText('Welcome')).toBeTruthy()
    })

    it('Example 1c: showModal variants render content', async () => {
        render(<><DynamicContentModal /><BaseModalRenderer /></>)
        await userEvent.click(screen.getByText('Show Welcome'))
        expect(screen.getByText('Welcome')).toBeTruthy()
        await userEvent.click(screen.getByText('Close'))
        await userEvent.click(screen.getByText('Show Goodbye'))
        expect(screen.getByText('Goodbye')).toBeTruthy()
    })

    it('Example 2: Confirmation Dialog cancels and deletes', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { })
        render(<><ConfirmationExample /><BaseModalRenderer /></>)
        await userEvent.click(screen.getByText('Delete Item'))
        expect(screen.getByText('Confirm Delete')).toBeTruthy()
        await userEvent.click(screen.getByText('Cancel'))
        expect(screen.queryByText('Confirm Delete')).toBeNull()
        await userEvent.click(screen.getByText('Delete Item'))
        await userEvent.click(screen.getByText('Delete'))
        expect(logSpy).toHaveBeenCalledWith('Deleted!')
        logSpy.mockRestore()
    })

    it('Example 3: Update Modal Content wizard steps and completes', async () => {
        render(<><UpdateableModalExample /><BaseModalRenderer /></>)
        await userEvent.click(screen.getByText('Open Wizard'))
        expect(screen.getByText('Step 1 of 3')).toBeTruthy()
        await userEvent.click(screen.getByText('Next'))
        expect(screen.getByText('Step 2 of 3')).toBeTruthy()
        await userEvent.click(screen.getByText('Next'))
        expect(screen.getByText('Step 3 of 3')).toBeTruthy()
        await userEvent.click(screen.getByText('Complete'))
        expect(screen.queryByText('Step 1 of 3')).toBeNull()
    })

    it('Example 4: Dynamic Modal with Form submits and closes', async () => {
        const logSpy = vi.spyOn(console, 'log').mockImplementation(() => { })
        render(<><FormModal /><BaseModalRenderer /></>)
        await userEvent.click(screen.getByText('Open Form'))
        expect(screen.getByText('Contact Form')).toBeTruthy()
        await userEvent.type(screen.getByPlaceholderText('Name'), 'John Doe')
        await userEvent.type(screen.getByPlaceholderText('Email'), 'john@example.com')
        await userEvent.click(screen.getByText('Submit'))
        expect(logSpy).toHaveBeenCalledWith('Form submitted')
        logSpy.mockRestore()
    })

    it('Example 5: Multiple Stacked Modals open and close', async () => {
        render(<><StackedModalsExample /><BaseModalRenderer renderMode={RenderMode.STACKED} /></>)
        await userEvent.click(screen.getByText('Open Stacked Modals'))
        await userEvent.click(screen.getByText('Open Another'))
        expect(screen.getByText('First Modal')).toBeTruthy()
        expect(screen.getByText('Second Modal')).toBeTruthy()
        await userEvent.click(screen.getByText('Close This Modal'))
        expect(screen.queryByText('Second Modal')).toBeNull()
        expect(screen.getByText('First Modal')).toBeTruthy()
    })

    it('Example 6: Custom Styling applies classes', async () => {
        render(<StyledModalExample />)
        await userEvent.click(screen.getByText('Show Styled Modal'))
        const dialog = document.body.querySelector('dialog#base-modal-wrapper')
        expect(dialog).toBeTruthy()
        expect(dialog?.className).toMatch(/custom-modal-wrapper/)
        const win = document.body.querySelector('.modal-window') as HTMLElement
        expect(win).toBeTruthy()
        expect(win.className).toMatch(/custom-modal-window/)
    })
})
