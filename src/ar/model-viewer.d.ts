import type { ModelViewerElement } from '@google/model-viewer'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<ModelViewerElement>, ModelViewerElement> & {
  readonly src?: string
  readonly alt?: string
  /** Uniform "x y z" model scale; AR with ar-scale="fixed" treats model units as meters. */
  readonly scale?: string
  readonly ar?: boolean
  readonly 'ar-modes'?: string
  readonly 'ar-scale'?: 'auto' | 'fixed'
  readonly 'ar-placement'?: 'floor' | 'wall'
  readonly 'camera-controls'?: boolean
  readonly 'camera-orbit'?: string
  readonly 'touch-action'?: string
  readonly 'shadow-intensity'?: string
  readonly 'environment-image'?: string
  readonly 'interaction-prompt'?: string
}

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes
    }
  }
}
