import { getFileInformation, IFileInformation } from "../src/index"
import * as fs from "fs"

test("returns the correct checksum for a file", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])

  const result: IFileInformation[] = await getFileInformation([
    new File([blob], "")
  ])
  expect(result[0].checksum).toEqual(
    "e2d0fe1585a63ec6009c8016ff8dda8b17719a637405a4e23c0ff81339148249"
  )
})

test("returns correct number of results", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])
  const file: File = new File([blob], "")

  const result: IFileInformation[] = await getFileInformation([
    file,
    file,
    file
  ])
  expect(result).toHaveLength(3)
})
