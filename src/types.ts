interface IFileInformation {
  checksum: string
  size: number
  path: string
  lastModified: Date
}
export type TFileInformation = (files: File[]) => Promise<IFileInformation[]>

export interface TdrFile extends File {
  webkitRelativePath: string
}
