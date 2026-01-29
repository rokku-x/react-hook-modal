# react-hook-modal

[![CI](https://github.com/rokku-x/react-hook-dialog/actions/workflows/ci.yml/badge.svg)](https://github.com/rokku-x/react-hook-dialog/actions/workflows/ci.yml)[![npm version](https://img.shields.io/npm/v/@rokku-x/react-hook-modal.svg)](https://www.npmjs.com/package/@rokku-x/react-hook-modal)[![build](https://github.com/rokku-x/react-hook-modal/actions/workflows/ci.yml/badge.svg)](https://github.com/rokku-x/react-hook-modal/actions) [![license](https://img.shields.io/npm/l/@rokku-x/react-hook-modal.svg)](LICENSE) [![downloads](https://img.shields.io/npm/dm/@rokku-x/react-hook-modal.svg)](https://www.npmjs.com/package/@rokku-x/react-hook-modal) ![TS](https://img.shields.io/badge/TS-%E2%9C%93-blue)

A powerful and flexible React modal hook library that supports stacking and multi-window modals, with multiple rendering modes, dynamic and static modal support, and zero dependencies (except React and Zustand).

## Installation

```bash
npm install @rokku-x/react-hook-modal
```

## Features

- 🎯 **Multiple Render Modes** - `STACKED`, `CURRENT_ONLY`, `CURRENT_HIDDEN_STACK`
- 🧱 **Stacking & Multi-Window** - Open multiple modals at once and control focus/order
- ⚡ **Static and Dynamic Modals** - Choose the best approach for your use case
- 🪝 **React Hooks API** - Easy-to-use hook-based interface
- 📦 **TypeScript Support** - Full type safety out of the box
- 🎨 **Customizable Styling** - Extensive styling props for complete control
- ♿ **Accessibility** - Built-in support for scroll prevention and inert attribute
- 📱 **Zero Dependencies** - Only requires React and Zustand

## Bundle Size

- ESM: ~2.42 kB gzipped (7.64 kB raw)
- CJS: ~2.11 kB gzipped (5.72 kB raw)

Measured with Vite build for v0.7.1.

## Runtime Performance

Measured locally (jsdom, React 18, macOS) using a microbenchmark:
- Push/Pop: ~7.6 µs per op
- Update Content: ~2.6 µs per op
- Focus Modal: ~1.1 µs per op
- Dynamic Portal Render: ~0.5 µs per call

Notes:
- Numbers are approximate and depend on device/load.
- Portal render figures reflect the cost of creating the portal when the modal window ref exists.

## Library Load Time

Measured in Node (dynamic import/require):
- CJS require: ~16.0 ms
- ESM import: ~20.5 ms

See perf harnesses under `src/__tests__/perf.test.ts` and `src/__tests__/perf-load.test.ts`.

## Quick Start

### 1. Setup the Base Modal Renderer

First, add the `BaseModalRenderer` at the root of your application:

```tsx
import { BaseModalRenderer, RenderMode } from '@rokku-x/react-hook-modal';

function App() {
  return (
    <>
      <YourComponents />
      <BaseModalRenderer renderMode={RenderMode.STACKED} />
    </>
  );
}
```

### 2. Use the Modal Hook

```tsx
import { useStaticModal } from '@rokku-x/react-hook-modal';

function MyComponent() {
  const [showModal, closeModal] = useStaticModal();
  
  return (
    <button onClick={() => showModal(
      <div className="modal-content">
        <h2>Hello Modal!</h2>
        <button onClick={closeModal}>Close</button>
      </div>
    )}>
      Open Modal
    </button>
  );
}
```

## API Reference

### BaseModalRenderer

The main component that renders all modals in your application. Must be mounted at the root level.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `renderMode` | `RenderMode` | `RenderMode.STACKED` | Determines how multiple modals are rendered |
| `id` | `string` | `'base-modal-wrapper'` | Unique identifier for the modal wrapper |
| `style` | `CSSProperties` | `undefined` | Inline styles for the dialog element |
| `className` | `string` | `undefined` | CSS class for the dialog element |
| `windowClassName` | `string` | `undefined` | CSS class applied to each modal window |
| `windowStyle` | `CSSProperties` | `undefined` | Inline styles for each modal window |
| `disableBackgroundScroll` | `boolean` | `true` | Prevents body scroll when modal is open |

#### Render Modes

| Mode | Behavior |
|------|----------|
| `STACKED` | All modals are visible and stacked on top of each other |
| `CURRENT_ONLY` | Only the topmost modal is visible |
| `CURRENT_HIDDEN_STACK` | All modals are in the DOM but only the topmost is visible (best for preserving state) |

## Helper Components: ModalBackdrop & ModalWindow

Two small presentational components are exported for convenience to simplify markup and styling.

- `ModalBackdrop` — A full-screen backdrop used to wrap the background and capture clicks (commonly used to close the modal). Accepts standard `div` props: `onClick`, `className`, `style`, etc.
- `ModalWindow` — A styled window container used to render modal content. Accepts standard `div` props and prevents event propagation from clicks inside the window.

Example usage:

```tsx
import { useStaticModal, ModalBackdrop, ModalWindow, BaseModalRenderer } from '@rokku-x/react-hook-modal';

function BackdropExample() {
  const [showModal, closeModal] = useStaticModal();

  return (
    <button onClick={() => showModal(
      <ModalBackdrop onClick={closeModal}>
        <ModalWindow>
          <h2>Title</h2>
          <p>Content inside modal window.</p>
          <button onClick={closeModal}>Close</button>
        </ModalWindow>
      </ModalBackdrop>
    )}>
      Show Modal with Backdrop
    </button>
  )
}
```

Using these helper components keeps modal markup consistent across your app and makes it easier to style/backdrop behavior.

### useStaticModal

Hook for displaying static modal content (content set when the modal is opened).

#### Returns

```typescript
[showModal, closeModal, focus, updateModalContent, id]
```

| Return Value | Type | Description |
|---|---|---|
| `showModal(el?: AcceptableElement, id?: string)` | `(el?: AcceptableElement, id?: string) => string` | Show a modal and target/reopen an instance with the provided `id`. Passing the same `id` will update/replace that instance. Returns the hook's id. |
| `showModal(el?: AcceptableElement, createNew?: boolean)` | `(el?: AcceptableElement, createNew?: boolean) => string` | Show a modal and create a new unique instance when `createNew === true`. Omit or pass `false` to use the hook's own id (single-instance default). Returns the hook's id. |
| `closeModal` | `(customId?: string) => boolean` | Close the given modal instance (defaults to the hook's id) |
| `focus` | `(customId?: string) => boolean` | Bring the given modal to the foreground (defaults to the hook's id) |
| `updateModalContent` | `(newContent: AcceptableElement, customId?: string) => boolean` | Update the content of the specified modal instance without closing |
| `id` | `string` | Unique identifier assigned to this hook instance |

#### Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `element` | `AcceptableElement` | `undefined` | Default content to display if `showModal` is called without arguments |

> 💡 Tip: You can now open multiple instances from a single `useStaticModal` hook by passing a custom id or `true` to `showModal`. Passing the same custom id will update/replace that instance instead of creating a new one.

#### Overloads & instance control

- `showModal(el?: AcceptableElement, id?: string)` — Open or target a named instance. Passing the same `id` will update/replace that instance.
- `showModal(el?: AcceptableElement, createNew?: boolean)` — Pass `true` to create a new unique instance each call. Omit or pass `false` to use the hook's own (single) id.

Examples:

```tsx
const [showModal, closeModal, focus, updateModalContent, id] = useStaticModal()

// Use hook id (single-instance)
showModal(<div>Default</div>)

// Create a unique one-off instance
const oneOffHookId = showModal(<div>One-off</div>, true)
console.log('one-off created by hook id:', oneOffHookId)

// Open or update a named instance
const myModalHookId = showModal(<div>Named</div>, 'my-modal')
console.log('named instance hook id (always hook id):', myModalHookId)

// Update a named instance's content later
updateModalContent(<div>Updated</div>, 'my-modal')

// Close a named instance
closeModal('my-modal')
```

> Note: `showModal` returns the hook's `id` (string) — the generated or hook id, not a close function.

### Migration (from older versions)

If you used the old return signature or relied on `showModal` returning a close function, update your code as follows:

```diff
- const [show, close, focus] = useStaticModal()
- const closeFn = show(<div>Hi</div>)
+ const [show, close, focus, updateModalContent, id] = useStaticModal()
+ const hookId = show(<div>Hi</div>) // returns hook id string
+ // for one-off instances use: show(<div>One-off</div>, true)
+ // for named instances use: show(<div>Named</div>, 'custom-id')
```

The new overloads also allow opening multiple live static instances via custom ids or `true` for one-off instances.

### useDynamicModal

Hook for rendering dynamic modal content (content rendered from within the modal).

#### Returns

```typescript
[renderModalElement, showModal, closeModal, focus, id, isForeground]
```

| Return Value | Type | Description |
|---|---|---|
| `renderModalElement` | `(el: ReactNode) => ReactNode` | Function to render content inside the modal |
| `showModal` | `() => void` | Function to open the modal |
| `closeModal` | `() => void` | Function to close the modal |
| `focus` | `() => boolean` | Bring this modal to the foreground |
| `id` | `string` | Unique identifier for this modal instance |
| `isForeground` | `boolean` | Whether this modal is currently in focus |

### useBaseModal

Low-level hook for direct modal store access. Used internally by other hooks.

#### Returns

```typescript
{
  pushModal: (modalId: string, el: AcceptableElement, isDynamic?: boolean) => string,
  popModal: (modalId: string) => boolean,
  updateModal: (modalId: string, newContent: AcceptableElement) => boolean,
  focusModal: (modalId: string) => boolean,
  getModal: (modalId: string) => [AcceptableElement | null, boolean] | undefined,
  getModalWindowRef: (modalId: string) => HTMLDivElement | undefined,
  getModalOrderIndex: (modalId: string) => number,
  currentModalId?: string,
  modalStackMap: Map<string, [AcceptableElement | null, boolean]>
}
```

## Examples

### Example 1: Basic Static Modal

```tsx
import { useStaticModal, BaseModalRenderer } from '@rokku-x/react-hook-modal';

function App() {
  return (
    <>
      <BasicModalExample />
      <BaseModalRenderer />
    </>
  );
}

function BasicModalExample() {
  const [showModal, closeModal] = useStaticModal();
  
  return (
    <button onClick={() => showModal(
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h2>Welcome</h2>
        <p>This is a basic modal example.</p>
        <button onClick={closeModal}>Close</button>
      </div>
    )}>
      Show Modal
    </button>
  );
}
```

### Example 1b: useStaticModal - Content in Hook Parameter

Pass the modal content directly to the `useStaticModal` hook. Call `showModal()` without arguments to display it.

```tsx
import { useStaticModal, BaseModalRenderer } from '@rokku-x/react-hook-modal';

function WelcomeModal() {
  const [showModal, closeModal] = useStaticModal(
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
      <h2>Welcome</h2>
      <p>This modal content is defined in the hook parameter.</p>
      <button onClick={closeModal}>Close</button>
    </div>
  );
  
  return <button onClick={showModal}>Show Welcome Modal</button>;
}

function App() {
  return (
    <>
      <WelcomeModal />
      <BaseModalRenderer />
    </>
  );
}
```

### Example 1c: useStaticModal - Content in showModal Call

Pass the modal content when calling `showModal()`. This approach is more flexible for dynamic content.

```tsx
import { useStaticModal, BaseModalRenderer } from '@rokku-x/react-hook-modal';

function DynamicContentModal() {
  const [showModal, closeModal] = useStaticModal();
  
  const showWelcome = () => {
    showModal(
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h2>Welcome</h2>
        <p>This modal content is provided when calling showModal().</p>
        <button onClick={closeModal}>Close</button>
      </div>
    );
  };
  
  const showGoodbye = () => {
    showModal(
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h2>Goodbye</h2>
        <p>Different content can be shown by calling showModal with different content.</p>
        <button onClick={closeModal}>Close</button>
      </div>
    );
  };
  
  return (
    <>
      <button onClick={showWelcome}>Show Welcome</button>
      <button onClick={showGoodbye}>Show Goodbye</button>
    </>
  );
}

function App() {
  return (
    <>
      <DynamicContentModal />
      <BaseModalRenderer />
    </>
  );
}
```

### Example 2: Confirmation Dialog

```tsx
import { useStaticModal, BaseModalRenderer } from '@rokku-x/react-hook-modal';

function ConfirmationExample() {
  const [showModal, closeModal] = useStaticModal();
  
  const handleDelete = () => {
    showModal(
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
        <h2>Confirm Delete</h2>
        <p>Are you sure you want to delete this item?</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={closeModal}>Cancel</button>
          <button 
            onClick={() => {
              console.log('Deleted!');
              closeModal();
            }}
            style={{ background: '#dc3545', color: 'white' }}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };
  
  return <button onClick={handleDelete}>Delete Item</button>;
}

function App() {
  return (
    <>
      <ConfirmationExample />
      <BaseModalRenderer />
    </>
  );
}
```

### Example 3: Update Modal Content

```tsx
import { useStaticModal, BaseModalRenderer } from 'react-hook-modal';
import { useState } from 'react';

function UpdateableModalExample() {
  const [showModal, closeModal, focus, updateModalContent, modalId] = useStaticModal();
  const [step, setStep] = useState(0);
  
  const openWizard = () => {
    setStep(0);
    showModal(renderStep(0));
  };
  
  const renderStep = (stepNum: number) => (
    <div style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '500px' }}>
      <h2>Step {stepNum + 1} of 3</h2>
      <p>This is step {stepNum + 1} content.</p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button 
          onClick={() => {
            const newStep = stepNum - 1;
            setStep(newStep);
            updateModalContent(renderStep(newStep));
          }}
          disabled={stepNum === 0}
        >
          Previous
        </button>
        <button 
          onClick={() => {
            if (stepNum === 2) {
              console.log('Wizard completed!');
              closeModal();
            } else {
              const newStep = stepNum + 1;
              setStep(newStep);
              updateModalContent(renderStep(newStep));
            }
          }}
        >
          {stepNum === 2 ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
  
  return <button onClick={openWizard}>Open Wizard</button>;
}

function App() {
  return (
    <>
      <UpdateableModalExample />
      <BaseModalRenderer />
    </>
  );
}
```

### Example 4: Dynamic Modal with Form

```tsx
import { useDynamicModal, BaseModalRenderer } from '@rokku-x/react-hook-modal';
import { useState } from 'react';

function FormModal() {
  const [renderModalElement, showModal, closeModal, focus, id, isForeground] = useDynamicModal();
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const openModal = () => {
    showModal();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    closeModal();
  };
  
  const modalContent = (
    <form onSubmit={handleSubmit} style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
      <h2>Contact Form</h2>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit">Submit</button>
        <button type="button" onClick={closeModal}>Cancel</button>
      </div>
    </form>
  );
  
  return (
    <div>
      <button onClick={openModal}>Open Form</button>
      {renderModalElement(modalContent)}
    </div>
  );
}

function App() {
  return (
    <>
      <FormModal />
      <BaseModalRenderer />
    </>
  );
}
```

### Example 5: Multiple Stacked Modals

```tsx
import { useStaticModal, BaseModalRenderer, RenderMode } from '@rokku-x/react-hook-modal';

function StackedModalsExample() {
  const [showModal1, closeModal1] = useStaticModal();
  const [showModal2, closeModal2] = useStaticModal();
  
  const openFirstModal = () => {
    showModal1(
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
        <h2>First Modal</h2>
        <p>This is the first modal.</p>
        <button onClick={() => openSecondModal()}>Open Another</button>
        <button onClick={closeModal1}>Close</button>
      </div>
    );
  };
  
  const openSecondModal = () => {
    showModal2(
      <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px', maxWidth: '400px' }}>
        <h2>Second Modal</h2>
        <p>This modal is stacked on top of the first one!</p>
        <button onClick={closeModal2}>Close This Modal</button>
      </div>
    );
  };
  
  return <button onClick={openFirstModal}>Open Stacked Modals</button>;
}

function App() {
  return (
    <>
      <StackedModalsExample />
      <BaseModalRenderer renderMode={RenderMode.STACKED} />
    </>
  );
}
```

// Example 5b: Multiple instances from a single hook (custom id / new instances)

function MultipleInstancesExample() {
  const [showModal, closeModal] = useStaticModal();

  const openTwoDifferent = () => {
    // Use custom ids to open/target distinct modal instances
    showModal(
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
        <h2>First modal</h2>
        <p>A modal opened using a custom id.</p>
        <button onClick={closeModal}>Close</button>
      </div>,
      'first-modal'
    );

    showModal(
      <div style={{ padding: '20px', background: '#f6f6f6', borderRadius: '8px', maxWidth: '400px' }}>
        <h2>Second modal</h2>
        <p>Another modal opened with a different id.</p>
        <button onClick={closeModal}>Close</button>
      </div>,
      'second-modal'
    );
  };

  const openOneOff = () => {
    // Pass `true` to create a new unique instance each time
    showModal(
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px', maxWidth: '400px' }}>
        <h2>One-off</h2>
        <p>This creates a unique instance every time (pass `true`).</p>
        <button onClick={closeModal}>Close</button>
      </div>,
      true
    );
  };

  return (
    <>
      <button onClick={openTwoDifferent}>Open Two Different Modals</button>
      <button onClick={openOneOff}>Open One-off Modal</button>
    </>
  );
}

### Example 5c: Named & One-off Instances (useStaticModal)

```tsx
import { useStaticModal, BaseModalRenderer } from '@rokku-x/react-hook-modal';

function MultipleInstancesAdvanced() {
  const [showModal, closeModal, focus, updateModalContent, id] = useStaticModal();

  const openNamed = () => {
    // Open/replace a named instance called 'named-a'
    showModal(
      <div style={{ padding: '20px', background: 'white' }}>
        <h2>Named A</h2>
        <p>This modal is opened with a custom id ('named-a').</p>
        <button onClick={() => closeModal('named-a')}>Close Named A</button>
      </div>,
      'named-a'
    );
  };

  const openOneOff = () => {
    // Create a one-off unique instance each time by passing `true`
    const oneOffHookId = showModal(
      <div style={{ padding: '20px', background: '#f7f7f7' }}>
        <h2>One-off</h2>
        <p>This instance is unique every call (created by passing <code>true</code>).</p>
      </div>,
      true
    );
    console.log('one-off created by hook id:', oneOffHookId);
  };

  const updateNamed = () => {
    updateModalContent(
      <div style={{ padding: '20px', background: 'white' }}>
        <h2>Named A (Updated)</h2>
        <p>Content was updated programmatically via <code>updateModalContent</code>.</p>
      </div>,
      'named-a'
    );
  };

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={openNamed}>Open/Update Named A</button>
      <button onClick={openOneOff}>Open One-off</button>
      <button onClick={updateNamed}>Update Named A</button>
      <div style={{ alignSelf: 'center', marginLeft: 12, color: '#666' }}>hook id: <code>{id}</code></div>
    </div>
  );
}

function App() {
  return (
    <>
      <MultipleInstancesAdvanced />
      <BaseModalRenderer />
    </>
  );
}
```

> This example shows how to open named instances (by passing a string id) and how to create one-off unique instances (by passing `true`). It also demonstrates using the returned `id` for reference in your UI.

### Example 6: Custom Styling

```tsx
import { useStaticModal, BaseModalRenderer } from '@rokku-x/react-hook-modal';

function StyledModalExample() {
  const [showModal, closeModal] = useStaticModal();
  
  return (
    <>
      <button onClick={() => showModal(
        <div style={{
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
        </div>
      )}>
        Show Styled Modal
      </button>
      <BaseModalRenderer 
        windowClassName="custom-modal-window"
        windowStyle={{ backdropFilter: 'blur(5px)' }}
        className="custom-modal-wrapper"
      />
    </>
  );
}
```

## Types

### RenderMode

```typescript
enum RenderMode {
  STACKED = 0,              // All modals visible and stacked
  CURRENT_ONLY = 1,         // Only topmost modal visible
  CURRENT_HIDDEN_STACK = 2  // All in DOM but only topmost visible
}
```

### AcceptableElement

```typescript
type AcceptableElement = React.ReactNode | (() => React.ReactNode);
```

## Best Practices

1. **Always mount `BaseModalRenderer` at the root** - Place it at the top level of your application
2. **Choose the right render mode** - Use `STACKED` for independent modals, `CURRENT_HIDDEN_STACK` to preserve state
3. **Use static modals for simple content** - Faster and simpler than dynamic modals
4. **Use dynamic modals for complex interactions** - Better for forms and interactive content
5. **Keep modals accessible** - Provide keyboard navigation and ARIA attributes
6. **Customize styling carefully** - Use `windowClassName` and `windowStyle` for consistent styling

## License

MIT
