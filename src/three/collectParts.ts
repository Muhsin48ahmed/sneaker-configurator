import {
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Object3D,
  type Side,
  type Texture,
  type Vector2,
} from 'three'
import { findPart, type PartId } from '../domain/catalog'

/** One renderable piece of the shoe, with the texture detail we keep from the source model. */
export interface ModelPart {
  readonly key: string
  readonly partId: PartId
  readonly geometry: BufferGeometry
  readonly position: Vector3
  readonly quaternion: Quaternion
  readonly scale: Vector3
  readonly normalMap: Texture | null
  readonly normalScale: Vector2
  /** Baked ambient occlusion: cheap, convincing contact darkening in creases. */
  readonly aoMap: Texture | null
  readonly side: Side
}

const decompose = (matrix: Matrix4) => {
  const position = new Vector3()
  const quaternion = new Quaternion()
  const scale = new Vector3()
  matrix.decompose(position, quaternion, scale)
  return { position, quaternion, scale }
}

const isConfigurableMesh = (object: Object3D): object is Mesh<BufferGeometry, MeshStandardMaterial> =>
  object instanceof Mesh && object.material instanceof MeshStandardMaterial && findPart(object.material.name) !== undefined

/**
 * Reads the loaded glTF scene and returns plain descriptors. We render our own materials
 * from these instead of mutating the cached glTF materials, so the source asset stays untouched.
 */
export const collectParts = (root: Object3D): readonly ModelPart[] => {
  root.updateMatrixWorld(true)
  const meshes: Mesh<BufferGeometry, MeshStandardMaterial>[] = []
  root.traverse((object) => {
    if (isConfigurableMesh(object)) meshes.push(object)
  })

  return meshes.map((mesh) => ({
    key: mesh.uuid,
    partId: mesh.material.name as PartId,
    geometry: mesh.geometry,
    ...decompose(mesh.matrixWorld),
    normalMap: mesh.material.normalMap,
    normalScale: mesh.material.normalScale,
    aoMap: mesh.material.aoMap,
    side: mesh.material.side,
  }))
}
