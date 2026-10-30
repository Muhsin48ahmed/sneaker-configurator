import type { ModelViewerElement } from '@google/model-viewer'
import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Box3, Vector3 } from 'three'
import type { Design } from '../domain/catalog'
import { useModalDialog } from '../hooks/useModalDialog'
import { DRACO_DECODER_PATH, MODEL_URL } from '../three/SneakerModel'
import { IconClose, IconCube } from '../ui/icons'
import { SHOE_LENGTH_METERS, applyDesignToModelViewer, realWorldScale } from './modelViewerAdapter'

type LoadState = 'loading' | 'ready' | 'error'

/**
 * model-viewer adds ~70 kB gzipped on top of three.js, and only shoppers who tap
 * "View in your room" need it, so it is imported on demand instead of shipping up front.
 */
let modelViewerReady: Promise<void> | null = null
const loadModelViewer = (): Promise<void> => {
  modelViewerReady ??= import('@google/model-viewer').then(({ ModelViewerElement }) => {
    ModelViewerElement.dracoDecoderLocation = DRACO_DECODER_PATH
  })
  return modelViewerReady
}

interface ArDialogProps {
  readonly design: Design
  readonly onClose: () => void
}

export function ArDialog({ design, onClose }: ArDialogProps) {
  const { dialogRef, close, backdropHandlers } = useModalDialog()
  const viewerRef = useRef<ModelViewerElement>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [arFailed, setArFailed] = useState(false)

  // Same GLB the 3D stage already loaded (served from cache). Computing the true-to-size
  // scale up front lets us pass it before model-viewer loads: changing `scale` after load
  // trips a null-scene bug in model-viewer 4.4's AR renderer.
  const { scene } = useGLTF(MODEL_URL, DRACO_DECODER_PATH)
  const arScale = useMemo(() => {
    const scale = realWorldScale(new Box3().setFromObject(scene).getSize(new Vector3()), SHOE_LENGTH_METERS)
    return `${scale} ${scale} ${scale}`
  }, [scene])

  useEffect(() => {
    let isActive = true
    loadModelViewer()
      .then(() => isActive && setLoadState('ready'))
      .catch((error: unknown) => {
        console.error('Failed to load the AR viewer', error)
        if (isActive) setLoadState('error')
      })
    return () => {
      isActive = false
    }
  }, [])

  // Once the GLB is in, paint the customer's design onto it.
  useEffect(() => {
    const viewer = viewerRef.current
    if (loadState !== 'ready' || !viewer) return

    const handleLoad = () => {
      try {
        applyDesignToModelViewer(viewer, design)
      } catch (error) {
        console.error('Could not apply the design to the AR model', error)
      }
    }
    const handleArStatus = (event: Event) => {
      const { status } = (event as CustomEvent<{ status: string }>).detail
      setArFailed(status === 'failed')
    }

    viewer.addEventListener('load', handleLoad)
    viewer.addEventListener('ar-status', handleArStatus)
    if (viewer.loaded) handleLoad()
    return () => {
      viewer.removeEventListener('load', handleLoad)
      viewer.removeEventListener('ar-status', handleArStatus)
    }
  }, [loadState, design])

  return (
    <dialog ref={dialogRef} className="ar-dialog" aria-labelledby="ar-title" onClose={onClose} {...backdropHandlers}>
      <div className="ar-dialog__inner">
        <header className="ar-dialog__header">
          <div>
            <h2 id="ar-title">View in your room</h2>
            <p>True-to-size preview of your exact design.</p>
          </div>
          <button type="button" className="icon-button" aria-label="Close" onClick={close}>
            <IconClose />
          </button>
        </header>

        <div className="ar-dialog__viewer">
          {loadState === 'loading' && <p className="ar-dialog__status" role="status">Preparing AR viewer…</p>}
          {loadState === 'error' && (
            <p className="ar-dialog__status" role="alert">
              The AR viewer could not load. Check your connection and try again.
            </p>
          )}
          {loadState === 'ready' && (
            <model-viewer
              ref={viewerRef}
              src={MODEL_URL}
              scale={arScale}
              alt="Your customized Aero Runner sneaker"
              ar
              ar-modes="webxr quick-look"
              ar-scale="fixed"
              ar-placement="floor"
              camera-controls
              camera-orbit="35deg 70deg auto"
              touch-action="pan-y"
              shadow-intensity="1"
              environment-image="/hdri/studio.hdr"
              exposure="0.9"
              tone-mapping="neutral"
              interaction-prompt="none"
            >
              {/* model-viewer shows this slot only once it has confirmed AR works on this device. */}
              <button type="button" slot="ar-button" className="primary-button ar-dialog__launch">
                <IconCube /> Place in your room
              </button>
            </model-viewer>
          )}
        </div>

        <footer className="ar-dialog__footer">
          <p className="ar-dialog__hint">
            No <strong>Place in your room</strong> button? AR needs a phone or tablet: Chrome on ARCore Android, or
            Safari on iPhone and iPad. Open this page there to put the shoe on your floor.
          </p>
          {arFailed && (
            <p className="panel__error" role="alert">
              AR couldn&apos;t start on this device. You can still rotate the preview above.
            </p>
          )}
        </footer>
      </div>
    </dialog>
  )
}
