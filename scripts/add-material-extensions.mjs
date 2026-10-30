#!/usr/bin/env node
/**
 * Declares KHR_materials_clearcoat and KHR_materials_sheen (with neutral zero values) on every
 * material in a .glb. Loaders then create physical materials, so model-viewer can drive
 * clearcoat (patent, leather) and sheen (suede) in AR. Idempotent: safe to run twice.
 *
 * Usage: node scripts/add-material-extensions.mjs public/models/sneaker.glb
 */
import { readFileSync, writeFileSync } from 'node:fs'

const GLB_MAGIC = 0x46546c67 // "glTF"
const CHUNK_JSON = 0x4e4f534a // "JSON"
const HEADER_BYTES = 12
const CHUNK_HEADER_BYTES = 8
const EXTENSIONS = {
  KHR_materials_clearcoat: { clearcoatFactor: 0, clearcoatRoughnessFactor: 0 },
  KHR_materials_sheen: { sheenColorFactor: [0, 0, 0], sheenRoughnessFactor: 0 },
}

const path = process.argv[2]
if (!path) {
  console.error('Usage: node scripts/add-material-extensions.mjs <file.glb>')
  process.exit(1)
}

const glb = readFileSync(path)
if (glb.readUInt32LE(0) !== GLB_MAGIC) throw new Error(`${path} is not a binary glTF file`)

const jsonLength = glb.readUInt32LE(HEADER_BYTES)
if (glb.readUInt32LE(HEADER_BYTES + 4) !== CHUNK_JSON) throw new Error('First GLB chunk is not JSON')
const jsonStart = HEADER_BYTES + CHUNK_HEADER_BYTES
const gltf = JSON.parse(glb.subarray(jsonStart, jsonStart + jsonLength).toString('utf8'))
const rest = glb.subarray(jsonStart + jsonLength) // BIN chunk (header + data), untouched

const materials = (gltf.materials ?? []).map((material) => ({
  ...material,
  extensions: { ...EXTENSIONS, ...material.extensions },
}))
const extensionsUsed = [...new Set([...(gltf.extensionsUsed ?? []), ...Object.keys(EXTENSIONS)])]
const updated = { ...gltf, materials, extensionsUsed }

// JSON chunks must be 4-byte aligned, padded with spaces.
const rawJson = Buffer.from(JSON.stringify(updated), 'utf8')
const paddedJson = Buffer.concat([rawJson, Buffer.alloc((4 - (rawJson.length % 4)) % 4, 0x20)])

const header = Buffer.alloc(HEADER_BYTES + CHUNK_HEADER_BYTES)
header.writeUInt32LE(GLB_MAGIC, 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(header.length + paddedJson.length + rest.length, 8)
header.writeUInt32LE(paddedJson.length, 12)
header.writeUInt32LE(CHUNK_JSON, 16)

writeFileSync(path, Buffer.concat([header, paddedJson, rest]))
console.log(`Updated ${materials.length} materials in ${path}`)
