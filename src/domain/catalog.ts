/**
 * Product catalog: everything a shopper can choose. Pure data, no rendering concerns
 * beyond the physically based (PBR) numbers each finish maps to.
 *
 * Part ids are the material names inside public/models/sneaker.glb.
 */

export type PartId = 'laces' | 'mesh' | 'caps' | 'inner' | 'sole' | 'stripes' | 'band' | 'patch'
export type ColorId = string
export type FinishId = 'matte' | 'suede' | 'leather' | 'patent' | 'metallic'
/** What the part is physically made of; decides how a plain "Matte" finish actually looks. */
export type Substrate = 'knit' | 'synthetic' | 'rubber'

export interface Part {
  readonly id: PartId
  readonly label: string
  readonly substrate: Substrate
  readonly finishIds: readonly FinishId[]
}

export interface Color {
  readonly id: ColorId
  readonly name: string
  readonly hex: string
}

/** Renderer-agnostic surface response; maps onto glTF PBR + clearcoat + sheen. */
export interface FinishSurface {
  readonly roughness: number
  readonly metalness: number
  readonly clearcoat: number
  readonly clearcoatRoughness: number
  /** 0 = no sheen, 1 = full velvety sheen tinted from the base color. */
  readonly sheen: number
  readonly sheenRoughness: number
  /** Strength of the mirror-like highlight. Low for fabrics, which otherwise read as plastic. */
  readonly specularIntensity: number
}

export interface Finish {
  readonly id: FinishId
  readonly name: string
  readonly description: string
  readonly priceCents: number
  readonly surface: FinishSurface
}

export interface PartStyle {
  readonly colorId: ColorId
  readonly finishId: FinishId
}

export type Design = Readonly<Record<PartId, PartStyle>>

export interface Colorway {
  readonly id: string
  readonly name: string
  readonly parts: Design
}

export const PRODUCT = {
  name: 'Aero Runner',
  tagline: 'Lightweight everyday trainer, built to your spec.',
  basePriceCents: 12900,
  currency: 'USD',
} as const

export const SIZES: readonly string[] = [
  '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '13',
]

export const PARTS: readonly Part[] = [
  { id: 'mesh', label: 'Upper', substrate: 'knit', finishIds: ['matte', 'suede', 'leather', 'patent'] },
  { id: 'caps', label: 'Toe & heel caps', substrate: 'synthetic', finishIds: ['matte', 'suede', 'leather', 'patent', 'metallic'] },
  { id: 'stripes', label: 'Side stripes', substrate: 'synthetic', finishIds: ['matte', 'leather', 'patent', 'metallic'] },
  { id: 'band', label: 'Heel band', substrate: 'synthetic', finishIds: ['matte', 'leather', 'patent', 'metallic'] },
  { id: 'patch', label: 'Tongue patch', substrate: 'synthetic', finishIds: ['matte', 'leather', 'metallic'] },
  { id: 'laces', label: 'Laces', substrate: 'knit', finishIds: ['matte', 'metallic'] },
  { id: 'inner', label: 'Lining', substrate: 'knit', finishIds: ['matte', 'suede'] },
  { id: 'sole', label: 'Sole', substrate: 'rubber', finishIds: ['matte', 'patent'] },
]

export const COLORS: readonly Color[] = [
  { id: 'chalk', name: 'Chalk White', hex: '#f4f4f2' },
  { id: 'bone', name: 'Bone', hex: '#e7dccb' },
  { id: 'onyx', name: 'Onyx', hex: '#1b1b1d' },
  { id: 'graphite', name: 'Graphite', hex: '#4a4d52' },
  { id: 'crimson', name: 'Crimson', hex: '#b3202d' },
  { id: 'sunset', name: 'Sunset', hex: '#f06a2b' },
  { id: 'volt', name: 'Volt', hex: '#d4f23b' },
  { id: 'teal', name: 'Teal', hex: '#138a83' },
  { id: 'royal', name: 'Royal', hex: '#2346b8' },
  { id: 'blush', name: 'Blush', hex: '#f2a7b9' },
  { id: 'gum', name: 'Gum', hex: '#b9773e' },
]

export const FINISHES: readonly Finish[] = [
  {
    id: 'matte',
    name: 'Matte',
    description: 'Soft, non-reflective knit',
    priceCents: 0,
    surface: { roughness: 0.85, metalness: 0, clearcoat: 0, clearcoatRoughness: 0, sheen: 0, sheenRoughness: 0, specularIntensity: 0.6 },
  },
  {
    id: 'suede',
    name: 'Suede',
    description: 'Brushed nap with a velvet sheen',
    priceCents: 900,
    surface: { roughness: 1, metalness: 0, clearcoat: 0, clearcoatRoughness: 0, sheen: 1, sheenRoughness: 0.6, specularIntensity: 0.25 },
  },
  {
    id: 'leather',
    name: 'Leather',
    description: 'Smooth full-grain, satin lustre',
    priceCents: 1200,
    surface: { roughness: 0.45, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4, sheen: 0, sheenRoughness: 0, specularIntensity: 0.7 },
  },
  {
    id: 'patent',
    name: 'Patent',
    description: 'High-gloss lacquered coat',
    priceCents: 1500,
    surface: { roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0, sheenRoughness: 0, specularIntensity: 1 },
  },
  {
    id: 'metallic',
    name: 'Metallic',
    description: 'Brushed metal-foil overlay',
    priceCents: 1800,
    surface: { roughness: 0.3, metalness: 0.85, clearcoat: 0, clearcoatRoughness: 0, sheen: 0, sheenRoughness: 0, specularIntensity: 1 },
  },
]

const style = (colorId: ColorId, finishId: FinishId): PartStyle => ({ colorId, finishId })

export const COLORWAYS: readonly Colorway[] = [
  {
    id: 'chalk',
    name: 'Chalk',
    parts: {
      mesh: style('chalk', 'matte'),
      caps: style('chalk', 'leather'),
      stripes: style('onyx', 'leather'),
      band: style('onyx', 'leather'),
      patch: style('onyx', 'matte'),
      laces: style('chalk', 'matte'),
      inner: style('chalk', 'matte'),
      sole: style('chalk', 'matte'),
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    parts: {
      mesh: style('onyx', 'matte'),
      caps: style('onyx', 'suede'),
      stripes: style('graphite', 'metallic'),
      band: style('graphite', 'leather'),
      patch: style('graphite', 'metallic'),
      laces: style('onyx', 'matte'),
      inner: style('graphite', 'matte'),
      sole: style('onyx', 'matte'),
    },
  },
  {
    id: 'volt',
    name: 'Volt Rush',
    parts: {
      mesh: style('graphite', 'matte'),
      caps: style('onyx', 'suede'),
      stripes: style('volt', 'patent'),
      band: style('volt', 'matte'),
      patch: style('volt', 'matte'),
      laces: style('volt', 'matte'),
      inner: style('onyx', 'matte'),
      sole: style('chalk', 'matte'),
    },
  },
  {
    id: 'varsity',
    name: 'Varsity Royal',
    parts: {
      mesh: style('chalk', 'leather'),
      caps: style('royal', 'suede'),
      stripes: style('royal', 'leather'),
      band: style('royal', 'leather'),
      patch: style('chalk', 'matte'),
      laces: style('chalk', 'matte'),
      inner: style('royal', 'matte'),
      sole: style('gum', 'matte'),
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    parts: {
      mesh: style('bone', 'suede'),
      caps: style('sunset', 'suede'),
      stripes: style('blush', 'leather'),
      band: style('sunset', 'leather'),
      patch: style('bone', 'matte'),
      laces: style('bone', 'matte'),
      inner: style('blush', 'suede'),
      sole: style('gum', 'matte'),
    },
  },
]

export const DEFAULT_COLORWAY_ID = 'chalk'

export const findPart = (id: string): Part | undefined => PARTS.find((part) => part.id === id)
export const findColor = (id: string): Color | undefined => COLORS.find((color) => color.id === id)
export const findFinish = (id: string): Finish | undefined => FINISHES.find((finish) => finish.id === id)
export const findColorway = (id: string): Colorway | undefined => COLORWAYS.find((cw) => cw.id === id)
