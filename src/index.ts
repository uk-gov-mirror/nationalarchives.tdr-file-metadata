import { bytes_to_hex, Sha256 } from "asmcrypto.js"
import { TFileInformation, TdrFile } from "./types"

export const getFileInformation: TFileInformation = async (
  files,
  progressFunction
) => {
  let processedFiles = 1
  return await Promise.all(
    files.map(async file => {
      const result = {
        checksum: await generateHash(file),
        size: file.size,
        lastModified: new Date(file.lastModified),
        path: (<TdrFile>file).webkitRelativePath
      }
      if (progressFunction) {
        progressFunction({ totalFiles: files.length, processedFiles })
        processedFiles += 1
      }
      return result
    })
  )
}

const sliceToUintArray: (blob: Blob) => Promise<Uint8Array> = async blob => {
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
export const generateHash: (file: File) => Promise<string> = async file => {
  const chunkSize = 100000000
  const chunkCount = Math.ceil(file.size / chunkSize)
  const sha256 = new Sha256()

  for (let i = 0; i < chunkCount; i += 1) {
    const start = i * chunkSize
    const end = start + chunkSize
    const slice: Blob = file.slice(start, end)
    sha256.process(await sliceToUintArray(slice))
  }

  const result = sha256.finish().result!
  return bytes_to_hex(result)
}
