export interface IFileMetadata {
  checksum: string
  size: number
  path: string
  lastModified: Date
}

interface IProgressInformation {
  totalFiles: number
  processedFiles: number
  percentageProcessed: number
}

export type TFileMetadata = (
  files: File[],
  progressFunction?: TProgressFunction | undefined,
  chunkSize?: number
) => Promise<IFileMetadata[]>

export type TChunkProgressFunction = () => void

export type TGenerateMetadata = (
  file: File,
  procesedFiles: number,
  progressFunction: TChunkProgressFunction
) => Promise<string>

export type TTotalChunks = (files: File[], chunkSize: number) => number

export type TSliceToArray = (blob: Blob) => Promise<Uint8Array>

export type TProgressFunction = (
  progressInformation: IProgressInformation
) => void

export interface TdrFile extends File {
  webkitRelativePath: string
}
