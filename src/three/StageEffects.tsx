import { Bloom, EffectComposer, N8AO, Noise, Outline, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode } from 'postprocessing'

/** Phones get half-resolution ambient occlusion: most of the look at a quarter of the cost. */
const IS_SMALL_SCREEN = window.matchMedia('(max-width: 640px)').matches
const OUTLINE_COLOR = '#e7e5e4'

/**
 * The "photography" layer:
 * - N8AO: screen-space ambient occlusion, so laces, eyelets and the collar sit *in* the shoe.
 * - Outline: a fine light edge around the hovered part (fed by <Select> in PartMesh).
 * - Bloom, thresholded high: only real specular glints (patent, metal foil) bloom, the way
 *   bright highlights glow through a camera lens. Matte surfaces are untouched.
 * - Khronos PBR Neutral tone mapping: built for e-commerce, keeps product colors accurate.
 * - Vignette + a whisper of film grain: the difference between "render" and "photograph".
 */
export function StageEffects() {
  return (
    // autoClear={false}: required by the Outline effect to read the selection mask correctly.
    <EffectComposer multisampling={4} autoClear={false}>
      <N8AO aoRadius={0.35} distanceFalloff={0.5} intensity={2.6} quality="high" halfRes={IS_SMALL_SCREEN} />
      <Outline visibleEdgeColor={OUTLINE_COLOR} hiddenEdgeColor={OUTLINE_COLOR} edgeStrength={1.6} blur xRay={false} />
      <Bloom mipmapBlur luminanceThreshold={1.4} luminanceSmoothing={0.3} intensity={0.35} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.25} darkness={0.75} />
      <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.05} />
    </EffectComposer>
  )
}
