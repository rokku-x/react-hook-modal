import React, { useEffect, useRef } from 'react'
import { useStaticModal, useDynamicModal, BaseModalRenderer, RenderMode, ModalBackdrop, ModalWindow } from '/src'
import { useBaseModalInternal } from '/src/hooks/useBaseModal'

// These examples are adapted from the README and will automatically open their modals on mount
export function Example1() {
  const [showModal, closeModal] = useStaticModal()
  useEffect(() => {
    showModal(
      <ModalBackdrop onClick={closeModal}>
        <ModalWindow style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
          <h2>Welcome</h2>
          <p>This is a basic modal example.</p>
          <button onClick={closeModal}>Close</button>
        </ModalWindow>
      </ModalBackdrop>
    )
  }, [])
  return null
}

export function Example2() {
  const content = (
    <ModalBackdrop>
      <ModalWindow style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h2>Welcome</h2>
        <p>This modal content is defined in the hook parameter.</p>
        <button>Close</button>
      </ModalWindow>
    </ModalBackdrop>
  )
  const [showModal] = useStaticModal(content)
  useEffect(() => { showModal() }, [])
  return null
}

export function Example3() {
  const [showModal, closeModal] = useStaticModal()
  useEffect(() => {
    showModal(
      <ModalBackdrop onClick={closeModal}>
        <ModalWindow style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
          <h2>Goodbye</h2>
          <p>Different content can be shown by calling showModal with different content.</p>
          <button onClick={closeModal}>Close</button>
        </ModalWindow>
      </ModalBackdrop>
    )
  }, [])
  return null
}

export function Example4() {
  const [showModal, closeModal] = useStaticModal()
  useEffect(() => {
    showModal(
      <ModalBackdrop onClick={closeModal}>
        <ModalWindow style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
          <h2>Confirm Delete</h2>
          <p>Are you sure you want to delete this item?</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={closeModal}>Cancel</button>
            <button onClick={() => { console.log('Deleted!'); closeModal(); }}>Delete</button>
          </div>
        </ModalWindow>
      </ModalBackdrop>
    )
  }, [])
  return null
}

export function Example5() {
  const [showModal, , , updateModalContent] = useStaticModal()
  useEffect(() => {
    const renderStep = (stepNum: number) => (
      <div>
        <h2>Step {stepNum + 1} of 3</h2>
        <div>
          <button onClick={() => { const prev = Math.max(0, stepNum - 1); updateModalContent(renderStep(prev)); }} disabled={stepNum === 0}>Previous</button>
          <button onClick={() => { const next = stepNum + 1; if (next > 2) { /* noop */ } else updateModalContent(renderStep(next)) }}>{stepNum === 2 ? 'Complete' : 'Next'}</button>
        </div>
      </div>
    )
    showModal(
      <ModalBackdrop>
        <ModalWindow style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '500px' }}>
          {renderStep(0)}
        </ModalWindow>
      </ModalBackdrop>
    )
  }, [])
  return null
}

export function Example6() {
  const [renderModalElement, showModal, closeModal] = useDynamicModal()
  const { isMounted } = useBaseModalInternal()

  useEffect(() => {
    showModal()
  }, [])

  const onSubmit = (e: any) => { e.preventDefault(); console.log('Form submitted'); closeModal() }
  const modal = (
    <ModalBackdrop onClick={closeModal}>
      <ModalWindow style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
        <form onSubmit={onSubmit}>
          <h2>Contact Form</h2>
          <input placeholder="Name" />
          <input placeholder="Email" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit">Submit</button>
            <button type="button" onClick={closeModal}>Cancel</button>
          </div>
        </form>
      </ModalWindow>
    </ModalBackdrop>
  )

  return isMounted ? renderModalElement(modal) : null
}

export function Example7() {
  const [showModal1, closeModal1] = useStaticModal()
  const [showModal2, closeModal2] = useStaticModal()
  useEffect(() => {
    showModal1(
      <ModalBackdrop onClick={closeModal1}>
        <ModalWindow style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
          <h2>First Modal</h2>
          <button onClick={() => showModal2(
            <ModalBackdrop onClick={closeModal2}>
              <ModalWindow style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px', maxWidth: '400px' }}>
                <h2>Second Modal</h2>
                <button onClick={closeModal2}>Close This Modal</button>
              </ModalWindow>
            </ModalBackdrop>
          )}>Open Another</button>
          <button onClick={closeModal1}>Close</button>
        </ModalWindow>
      </ModalBackdrop>
    )
    // open the second one after a short delay so both are visible stacked
    setTimeout(() => showModal2(
      <ModalBackdrop onClick={closeModal2}>
        <ModalWindow style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px', maxWidth: '400px' }}>
          <h2>Second Modal</h2>
          <button onClick={closeModal2}>Close This Modal</button>
        </ModalWindow>
      </ModalBackdrop>
    ), 50)
  }, [])
  return null
}

export function Example8() {
  const [showModal, closeModal] = useStaticModal()
  useEffect(() => {
    showModal(
      <ModalBackdrop onClick={() => closeModal('first-modal')}>
        <ModalWindow style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
          <h2>First modal</h2>
          <p>A modal opened using a custom id.</p>
          <button onClick={() => closeModal('first-modal')}>Close</button>
        </ModalWindow>
      </ModalBackdrop>,
      'first-modal'
    )

    showModal(
      <ModalBackdrop onClick={() => closeModal('second-modal')}>
        <ModalWindow style={{ padding: '20px', background: '#f6f6f6', borderRadius: '8px', maxWidth: '400px' }}>
          <h2>Second modal</h2>
          <p>Another modal opened with a different id.</p>
          <button onClick={() => closeModal('second-modal')}>Close</button>
        </ModalWindow>
      </ModalBackdrop>,
      'second-modal'
    )

    setTimeout(() => showModal(
      <ModalBackdrop onClick={closeModal}>
        <ModalWindow style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
          <h2>One-off</h2>
          <p>Unique instance</p>
          <button onClick={closeModal}>Close</button>
        </ModalWindow>
      </ModalBackdrop>, true
    ), 50)
  }, [])
  return null
}

export function Example9() {
  const [showModal, closeModal, focus, updateModalContent, id] = useStaticModal()

  useEffect(() => {
    // open named instance
    showModal(
      <ModalBackdrop onClick={() => closeModal('named-a')}>
        <ModalWindow style={{ padding: 20, background: 'white' }}>
          <h2>Named A</h2>
          <p>This modal is opened with a custom id ('named-a').</p>
          <button onClick={() => closeModal('named-a')}>Close Named A</button>
        </ModalWindow>
      </ModalBackdrop>,
      'named-a'
    )

    // open a one-off
    setTimeout(() => showModal(
      <ModalBackdrop>
        <ModalWindow style={{ padding: 20, background: '#f7f7f7' }}>
          <h2>One-off</h2>
          <p>This instance is unique every call.</p>
        </ModalWindow>
      </ModalBackdrop>, true
    ), 50)

    // then update named instance
    setTimeout(() => updateModalContent(
      <ModalBackdrop>
        <ModalWindow style={{ padding: 20, background: 'white' }}>
          <h2>Named A (Updated)</h2>
          <p>Content was updated programmatically via <code>updateModalContent</code>.</p>
        </ModalWindow>
      </ModalBackdrop>,
      'named-a'
    ), 150)
  }, [])

  return null
}

export function Example10() {
  const [showModal, closeModal] = useStaticModal()
  useEffect(() => {
    showModal(
      <ModalBackdrop onClick={closeModal}>
        <ModalWindow style={{
          padding: '30px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
        }}>
          <h2>Styled Modal</h2>
          <p>This modal has custom styling!</p>
          <button 
            onClick={closeModal}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </ModalWindow>
      </ModalBackdrop>
    )
  }, [])
  return null
}

export default { Example1, Example2, Example3, Example4, Example5, Example6, Example7, Example8, Example9, Example10 };
