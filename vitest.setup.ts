import '@testing-library/jest-dom'

// Polyfill HTMLDialogElement methods for jsdom environment
// jsdom doesn't implement showModal/close; BaseModalRenderer calls these.
if (typeof (global as any).HTMLDialogElement !== 'undefined') {
    const proto = (global as any).HTMLDialogElement.prototype as any
    if (typeof proto.showModal !== 'function') {
        proto.showModal = function () { this.open = true }
    }
    if (typeof proto.close !== 'function') {
        proto.close = function () { this.open = false }
    }
}
