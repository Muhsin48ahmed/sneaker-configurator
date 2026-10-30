import { Environment, Lightformer } from '@react-three/drei'

/** Poly Haven "Studio Small 08" (CC0, Sergej Majboroda): a real softbox photo studio. */
const STUDIO_HDRI = '/hdri/studio.hdr'
const ENVIRONMENT_INTENSITY = 0.6
const SHADOW_MAP_SIZE = 2048

/**
 * Lit like a dark product-launch shoot:
 * - A real studio HDRI supplies believable reflections (softbox highlights in the patent,
 *   gentle falloff across the knit) — the biggest single step away from a "CG" look.
 * - Two cool rim strips are layered into that environment to trace the shoe's silhouette
 *   against the black stage, plus a faint warm kicker from the front.
 * - One soft spotlight from above-front is the key light and the only shadow caster.
 * The environment is baked once (frames={1}); nothing in the studio moves.
 */
export function StudioLighting() {
  return (
    <>
      <Environment files={STUDIO_HDRI} environmentIntensity={ENVIRONMENT_INTENSITY} frames={1}>
        <Lightformer form="rect" intensity={5} color="#eef2ff" position={[-6, 1.5, -2]} rotation-y={Math.PI / 2.4} scale={[12, 1.2, 1]} />
        <Lightformer form="rect" intensity={4} color="#eef2ff" position={[6, 1.5, -2]} rotation-y={-Math.PI / 2.4} scale={[12, 1.2, 1]} />
        <Lightformer form="circle" intensity={0.8} color="#ffd9b0" position={[0, 0.5, 7]} scale={5} />
      </Environment>
      <spotLight
        position={[2.5, 6.5, 3.5]}
        angle={0.42}
        penumbra={1}
        intensity={32}
        decay={2}
        castShadow
        shadow-mapSize={[SHADOW_MAP_SIZE, SHADOW_MAP_SIZE]}
        shadow-bias={-0.0002}
        shadow-radius={6}
      />
    </>
  )
}
