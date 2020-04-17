import { bytes_to_hex, Sha256 } from "asmcrypto.js"
import {
  TFileMetadata,
  TdrFile,
  TTotalChunks,
  TSliceToArray,
  IFileMetadata
} from "./types"

export const extractFileMetadata: TFileMetadata = async (
  files,
  progressFunction,
  chunkSizeBytes = 100000000
) => {
  let processedChunks = 0
  let processedFiles = 0
  const totalChunks = getTotalChunks(files, chunkSizeBytes)
  const updateProgress: (
    processedChunks: number,
    processedFiles: number
  ) => void = (processedChunks, processedFiles) => {
    if (progressFunction) {
      progressFunction({
        percentageProcessed: Math.round((processedChunks / totalChunks) * 100),
        totalFiles: files.length,
        processedFiles
      })
    }
  }

  const arr: IFileMetadata[] = []
  for (const file of files) {
    const chunkCount = Math.ceil(file.size / chunkSizeBytes)
    const sha256 = new Sha256()
    for (let i = 0; i < chunkCount; i += 1) {
      const start = i * chunkSizeBytes
      const end = start + chunkSizeBytes
      const slice: Blob = file.slice(start, end)
      sha256.process(await sliceToUintArray(slice))
      processedChunks += 1
      updateProgress(processedChunks, processedFiles)
    }
    const { size, lastModified } = file

    const result = sha256.finish().result!
    const checksum = bytes_to_hex(result).trim()
    arr.push({
      checksum,
      size,
      lastModified: new Date(lastModified),
      path: (<TdrFile>file).webkitRelativePath,
      file
    })
    processedFiles += 1
    updateProgress(processedChunks, processedFiles)
  }
  return arr
}

const getTotalChunks: TTotalChunks = (files, chunkSizeBytes) => {
  return Array.from(files)
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
