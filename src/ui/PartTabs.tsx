import { useEffect, useRef, type KeyboardEvent } from 'react'
import { PARTS, findColor, findFinish, type Design, type PartId } from '../domain/catalog'
import { IconChevronLeft, IconChevronRight } from './icons'
import { partPanelId, partTabId } from './partTabIds'

const STEP_BY_KEY: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

interface PartTabsProps {
  readonly design: Design
  readonly selectedId: PartId
  readonly onSelect: (partId: PartId) => void
}

const wrapIndex = (index: number) => (index + PARTS.length) % PARTS.length

/**
 * WAI-ARIA tabs laid out as a scrollable chip rail with previous/next buttons.
 * Arrow keys, Home and End move between parts, so the 3D picker has a keyboard equivalent.
 */
export function PartTabs({ design, selectedId, onSelect }: PartTabsProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const selectedIndex = PARTS.findIndex((part) => part.id === selectedId)

  // Keep the active chip visible when selection changes from the 3D view or the arrows.
  // Scroll only the rail, horizontally: scrollIntoView would also scroll the page.
  useEffect(() => {
    const list = listRef.current
    const tab = list?.querySelector<HTMLButtonElement>(`#${partTabId(selectedId)}`)
    if (!list || !tab) return
    const listBox = list.getBoundingClientRect()
    const tabBox = tab.getBoundingClientRect()
    const inset = Number.parseFloat(getComputedStyle(list).paddingLeft) || 0
    if (tabBox.left < listBox.left + inset) list.scrollBy({ left: tabBox.left - listBox.left - inset })
    else if (tabBox.right > listBox.right - inset) list.scrollBy({ left: tabBox.right - listBox.right + inset })
  }, [selectedId])

  const selectIndex = (index: number, shouldFocus: boolean) => {
    const next = PARTS[wrapIndex(index)]
    onSelect(next.id)
    if (shouldFocus) listRef.current?.querySelector<HTMLButtonElement>(`#${partTabId(next.id)}`)?.focus()
  }

  const nextIndexForKey = (key: string): number | null => {
    if (key === 'Home') return 0
    if (key === 'End') return PARTS.length - 1
    const step = STEP_BY_KEY[key]
    return step === undefined ? null : selectedIndex + step
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nextIndex = nextIndexForKey(event.key)
    if (nextIndex === null) return
    event.preventDefault()
    selectIndex(nextIndex, true)
  }

  return (
    <div className="part-rail">
      <div className="part-rail__header">
        <span className="part-rail__count">
          Part {selectedIndex + 1} of {PARTS.length}
        </span>
        <div className="part-rail__arrows">
          <button type="button" className="round-button" aria-label="Previous part" onClick={() => selectIndex(selectedIndex - 1, false)}>
            <IconChevronLeft />
          </button>
          <button type="button" className="round-button" aria-label="Next part" onClick={() => selectIndex(selectedIndex + 1, false)}>
            <IconChevronRight />
          </button>
        </div>
      </div>
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
    </div>
  )
}
