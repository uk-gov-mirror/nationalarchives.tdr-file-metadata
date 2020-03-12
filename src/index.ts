import { bytes_to_hex, Sha256 } from "asmcrypto.js"

export interface IFileInformation {
  checksum: string
}
type TFileInformation = (files: File[]) => Promise<IFileInformation[]>

export const getFileInformation: TFileInformation = async files =>
  await Promise.all(
    files.map(async file => ({
      checksum: await generateHash(file)
    }))
  )

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
