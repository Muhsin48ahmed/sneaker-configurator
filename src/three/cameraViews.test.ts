import { describe, expect, test } from 'vitest'
import { PARTS } from '../domain/catalog'
import { OVERVIEW_VIEW, PART_VIEWS, viewToLookAt } from './cameraViews'

const rounded = (values: readonly number[]) => values.map((v) => Math.round(v * 1000) / 1000)

describe('viewToLookAt', () => {
  test('places a level, zero-azimuth camera straight down the +z axis from its target', () => {
    const lookAt = viewToLookAt({ azimuthDeg: 0, polarDeg: 90, distance: 3, target: [0, 0, 0] })

    expect(rounded(lookAt)).toEqual([0, 0, 3, 0, 0, 0])
  })

  test('swings to +x at 90° azimuth and offsets by the target', () => {
    const lookAt = viewToLookAt({ azimuthDeg: 90, polarDeg: 90, distance: 2, target: [0.5, 0.1, 0] })

    expect(rounded(lookAt)).toEqual([2.5, 0.1, 0, 0.5, 0.1, 0])
  })

  test('looks straight down at 0° polar', () => {
    const lookAt = viewToLookAt({ azimuthDeg: 45, polarDeg: 0, distance: 4, target: [0, 0, 0] })

    expect(rounded(lookAt)).toEqual([0, 4, 0, 0, 0, 0])
  })
})

describe('camera views', () => {
  test('defines a focus view for every configurable part', () => {
    for (const part of PARTS) {
      expect(PART_VIEWS[part.id], part.id).toBeDefined()
    }
  })

  test('keeps every view above the floor and outside the shoe', () => {
    for (const view of [OVERVIEW_VIEW, ...Object.values(PART_VIEWS)]) {
      expect(view.polarDeg).toBeLessThanOrEqual(95)
      expect(view.distance).toBeGreaterThan(1.5)
    }
  })
})
