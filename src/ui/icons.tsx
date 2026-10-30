import type { ReactNode } from 'react'

/** Lucide-style line icons, inlined so there is no icon font or extra request. */
function Icon({ children }: { readonly children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const IconRotate = () => (
  <Icon>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 3v6h-6" />
  </Icon>
)

export const IconPlus = () => (
  <Icon>
    <path d="M12 5v14M5 12h14" />
  </Icon>
)

export const IconMinus = () => (
  <Icon>
    <path d="M5 12h14" />
  </Icon>
)

export const IconReset = () => (
  <Icon>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 3v6h6" />
    <circle cx="12" cy="12" r="1.5" />
  </Icon>
)

export const IconBag = () => (
  <Icon>
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 10V6a3 3 0 0 1 6 0v4" />
  </Icon>
)

export const IconCube = () => (
  <Icon>
    <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
    <path d="m3 7 9 5 9-5M12 12v10" />
  </Icon>
)

export const IconClose = () => (
  <Icon>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)

export const IconTrash = () => (
  <Icon>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Icon>
)

export const IconChevronLeft = () => (
  <Icon>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)

export const IconChevronRight = () => (
  <Icon>
    <path d="m9 18 6-6-6-6" />
  </Icon>
)

export const IconTruck = () => (
  <Icon>
    <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" />
    <circle cx="7" cy="17.5" r="1.5" />
    <circle cx="17" cy="17.5" r="1.5" />
  </Icon>
)

export const IconReturn = () => (
  <Icon>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Icon>
)

export const IconClock = () => (
  <Icon>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
)

export const IconCheck = () => (
  <Icon>
    <path d="m5 12 5 5L20 7" />
  </Icon>
)
