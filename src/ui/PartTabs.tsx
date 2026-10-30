import { useRef, type KeyboardEvent } from 'react'
import { PARTS, findColor, findFinish, type Design, type PartId } from '../domain/catalog'
import { partPanelId, partTabId } from './partTabIds'

const STEP_BY_KEY: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

interface PartTabsProps {
  readonly design: Design
  readonly selectedId: PartId
  readonly onSelect: (partId: PartId) => void
}

/** WAI-ARIA tabs: arrow keys move between parts, so the 3D picker has a keyboard equivalent. */
export function PartTabs({ design, selectedId, onSelect }: PartTabsProps) {
  const listRef = useRef<HTMLDivElement>(null)

  const nextIndexForKey = (key: string): number | null => {
    if (key === 'Home') return 0
    if (key === 'End') return PARTS.length - 1
    const step = STEP_BY_KEY[key]
    if (step === undefined) return null
    const index = PARTS.findIndex((part) => part.id === selectedId)
    return (index + step + PARTS.length) % PARTS.length
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nextIndex = nextIndexForKey(event.key)
    if (nextIndex === null) return
    event.preventDefault()
    const next = PARTS[nextIndex]
    onSelect(next.id)
    listRef.current?.querySelector<HTMLButtonElement>(`#${partTabId(next.id)}`)?.focus()
  }

  return (
    <div ref={listRef} className="part-tabs" role="tablist" aria-label="Shoe part" onKeyDown={handleKeyDown}>
      {PARTS.map((part) => {
        const style = design[part.id]
        const color = findColor(style.colorId)
        const isSelected = part.id === selectedId
        return (
          <button
            key={part.id}
            id={partTabId(part.id)}
            type="button"
            role="tab"
            className="part-tab"
            aria-selected={isSelected}
            aria-controls={partPanelId}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(part.id)}
          >
            <span className="part-tab__dot" style={{ background: color?.hex }} aria-hidden="true" />
            <span className="part-tab__text">
              <span className="part-tab__label">{part.label}</span>
              <span className="part-tab__meta">
                {color?.name} · {findFinish(style.finishId)?.name}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
