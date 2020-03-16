import { bytes_to_hex, Sha256 } from "asmcrypto.js"
import {
  TFileMetadata,
  TdrFile,
  TGenerateMetadata,
  TTotalChunks,
  TSliceToArray,
  TChunkProgressFunction
} from "./types"

export const extractFileMetadata: TFileMetadata = async (
  files,
  progressFunction,
  chunkSizeBytes = 100000000
) => {
  let processedChunks = 0
  const totalChunks = getTotalChunks(files, chunkSizeBytes)

  const chunkProgress: TChunkProgressFunction = () => {
    processedChunks += 1
    const ratioProcessed = processedChunks / totalChunks
    const percentageProcessed = Math.round(ratioProcessed * 100)
    const totalFiles = files.length
    const processedFiles = Math.floor(ratioProcessed * totalFiles)
    if (progressFunction) {
      progressFunction({
        totalFiles,
        processedFiles,
        percentageProcessed
      })
    }
  }

  return await Promise.all(
    files.map(async file => {
      const result = {
        checksum: await generateHash(file, chunkSizeBytes, chunkProgress),
        size: file.size,
        lastModified: new Date(file.lastModified),
        path: (<TdrFile>file).webkitRelativePath
      }
      return result
    })
  )
}

const getTotalChunks: TTotalChunks = (files, chunkSizeBytes) => {
  return files
    .map(file => Math.ceil(file.size / chunkSizeBytes))
    .reduce((a, b) => a + b)
}

const sliceToUintArray: TSliceToArray = async blob => {
  const fileReader = new FileReader()
  fileReader.readAsArrayBuffer(blob)
  return await new Promise(resolve => {
    fileReader.onload = () => {
      const { result } = fileReader
      if (result instanceof ArrayBuffer) {
        resolve(new Uint8Array(result))
      }
    }
  })
}
export const generateHash: TGenerateMetadata = async (
  file,
  chunkSizeBytes,
  chunkProgressFunction
) => {
  const chunkCount = Math.ceil(file.size / chunkSizeBytes)
  const sha256 = new Sha256()

  for (let i = 0; i < chunkCount; i += 1) {
    const start = i * chunkSizeBytes
    const end = start + chunkSizeBytes
    const slice: Blob = file.slice(start, end)
    sha256.process(await sliceToUintArray(slice))
    chunkProgressFunction()
  }

  const result = sha256.finish().result!
  return bytes_to_hex(result).trim()
}
