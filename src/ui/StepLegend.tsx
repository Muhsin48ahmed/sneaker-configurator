import type { ReactNode } from 'react'

interface StepLegendProps {
  readonly step: string
  readonly title: string
  readonly value?: ReactNode
}

/** Numbered section heading used as a <legend>, so the step reads as the group's label. */
export function StepLegend({ step, title, value }: StepLegendProps) {
  return (
    <legend className="step-legend">
      <span className="step-legend__number" aria-hidden="true">
        {step}
      </span>
      <span className="step-legend__title">{title}</span>
      {value !== undefined && <span className="step-legend__value">{value}</span>}
    </legend>
  )
}
