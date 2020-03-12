import { getFileInformation } from "../src/index"
import * as fs from "fs"

test("returns the correct checksum for a file", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])

  const result = await getFileInformation([new File([blob], "")])
  expect(result[0].checksum).toEqual(
    "e2d0fe1585a63ec6009c8016ff8dda8b17719a637405a4e23c0ff81339148249"
  )
})

test("returns correct number of results", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])
  const file: File = new File([blob], "")

  const result = await getFileInformation([file, file, file])
  expect(result).toHaveLength(3)
})

test("returns the correct file size", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])

  const result = await getFileInformation([new File([blob], "")])
  expect(result[0].size).toEqual(19)
})

test("returns the correct last modified date", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])

  const result = await getFileInformation([
    new File([blob], "", { lastModified: 1584027654000 })
  ])
  expect(result[0].lastModified).toEqual(new Date("2020-03-12T15:40:54.000Z"))
})

test("returns the correct path", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])
  const file = new File([blob], "")
  Object.defineProperty(file, "webkitRelativePath", { value: "/a/path" })
  const result = await getFileInformation([file])
  expect(result[0].path).toEqual("/a/path")
})

test("calls the callback function correctly", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])
  const file = new File([blob], "")
  const callback = jest.fn()
  await getFileInformation([file, file], callback)

  expect(callback.mock.calls).toHaveLength(2)
  expect(callback.mock.calls[0][0]).toStrictEqual({
    totalFiles: 2,
    processedFiles: 1
  })
  expect(callback.mock.calls[1][0]).toStrictEqual({
    totalFiles: 2,
    processedFiles: 2
  })
})
