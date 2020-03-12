interface IFileInformation {
  checksum: string
}
export type TFileInformation = (files: File[]) => Promise<IFileInformation[]>

export interface TdrFile extends File {
  webkitRelativePath: string
}
