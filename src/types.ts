interface IFileInformation {
  checksum: string
  size: number
  path: string
  lastModified: Date
}

interface IProgressInformation {
  totalFiles: number
  processedFiles: number
}

export type TFileInformation = (
  files: File[],
  progressFunction?: TProgressFunction | undefined
) => Promise<IFileInformation[]>

export type TProgressFunction = (
  progressInformation: IProgressInformation
) => void

export interface TdrFile extends File {
  webkitRelativePath: string
}
