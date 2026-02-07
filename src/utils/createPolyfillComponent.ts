import React, { forwardRef, ComponentType, ReactElement, Ref } from 'react';

const isReact19 = parseInt(React.version.split('.')[0]) >= 19;

export function createPolyfillComponent<T extends HTMLElement, P = {}>(Component: (props: P & { ref?: Ref<T> }) => ReactElement | null): ComponentType<P & { ref?: Ref<T> }> {

    if (isReact19) return Component as any;

    const Box = forwardRef<T, P>((props, ref) => {
        return React.createElement(Component, { ...(props as any), ref });
    });

    Box.displayName = Component.name || 'Component';

    return Box as any;
}