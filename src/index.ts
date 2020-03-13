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
  chunkSize = 100000000
) => {
  let processedChunks = 0
  const totalChunks = getTotalChunks(files, chunkSize)

  return await Promise.all(
    files.map(async file => {
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

      const result = {
        checksum: await generateHash(file, chunkSize, chunkProgress),
        size: file.size,
        lastModified: new Date(file.lastModified),
        path: (<TdrFile>file).webkitRelativePath
      }
      return result
    })
  )
}

const getTotalChunks: TTotalChunks = (files, chunkSize) => {
  return files
    .map(file => Math.ceil(file.size / chunkSize))
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
  chunkSize,
  chunkProgressFunction
) => {
  const chunkCount = Math.ceil(file.size / chunkSize)
  const sha256 = new Sha256()

  for (let i = 0; i < chunkCount; i += 1) {
    const start = i * chunkSize
    const end = start + chunkSize
    const slice: Blob = file.slice(start, end)
    sha256.process(await sliceToUintArray(slice))
    chunkProgressFunction()
  }

  const result = sha256.finish().result!
  return bytes_to_hex(result)
}
