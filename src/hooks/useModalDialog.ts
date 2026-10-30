import { useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'

/**
 * Opens a native <dialog> as a modal on mount and closes it on a backdrop click.
 * A click only counts as a backdrop click if the press also *started* on the backdrop,
 * so dragging (e.g. orbiting a 3D preview) and releasing outside doesn't close it.
 */
export const useModalDialog = () => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const pressStartedOnBackdrop = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    // StrictMode runs effects twice; older Safari throws if showModal() is called on an open dialog.
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const close = () => dialogRef.current?.close()

  const backdropHandlers = {
    onPointerDown: (event: PointerEvent<HTMLDialogElement>) => {
      pressStartedOnBackdrop.current = event.target === dialogRef.current
    },
    onClick: (event: MouseEvent<HTMLDialogElement>) => {
      if (pressStartedOnBackdrop.current && event.target === dialogRef.current) close()
      pressStartedOnBackdrop.current = false
    },
  }

  return { dialogRef, close, backdropHandlers } as const
}
