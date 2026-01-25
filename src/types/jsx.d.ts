import React from 'react';

declare module 'react' {
    interface HTMLAttributes<T> {
        /**
         * The `inert` attribute is used to make elements unfocusable and unavailable to assistive technologies.
         * It's not yet part of React's built-in types in some TS versions, so we extend it here.
         */
        inert?: '' | boolean | undefined;
    }
}
