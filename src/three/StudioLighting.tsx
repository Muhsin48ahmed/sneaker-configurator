import { Environment, Lightformer } from '@react-three/drei'

/**
 * A virtual photo studio. Lightformers are emissive cards rendered once into an
 * environment map, so we get softbox-style reflections with no HDR file to download.
 */
export function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      {/* Key light: gives the shoe a clear top-left shading direction. */}
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <Environment resolution={256} frames={1}>
        {/* Overhead softbox: broad, soft highlight along the top of the upper. */}
        <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[10, 6, 1]} />
        {/* Rim strips: crisp edge highlights that separate the shoe from the background. */}
        <Lightformer form="rect" intensity={2.5} position={[-6, 1, -2]} rotation-y={Math.PI / 2} scale={[20, 1.2, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[6, 1, -2]} rotation-y={-Math.PI / 2} scale={[20, 1.2, 1]} />
        {/* Warm front fill: keeps dark colorways from going muddy. */}
        <Lightformer form="circle" intensity={1.2} color="#ffe2c4" position={[0, 1, 6]} scale={4} />
      </Environment>
    </>
  )
}
