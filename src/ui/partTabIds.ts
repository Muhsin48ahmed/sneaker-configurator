import type { PartId } from '../domain/catalog'

/** Shared ids that link the part tabs to their tabpanel (aria-controls / aria-labelledby). */
export const partPanelId = 'part-options-panel'
export const partTabId = (partId: PartId) => `part-tab-${partId}`
