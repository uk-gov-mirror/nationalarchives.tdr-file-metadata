import { extractFileMetadata } from "../src/index"
import * as fs from "fs"

test("returns the correct checksum for a file", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])

  const result = await extractFileMetadata([new File([blob], "")])
  expect(result[0].checksum).toEqual(
    "e2d0fe1585a63ec6009c8016ff8dda8b17719a637405a4e23c0ff81339148249"
  )
})

test("returns the correct checksum for a file with a chunk size smaller than file size", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])

  const result = await extractFileMetadata([new File([blob], "")], jest.fn(), 1)
  expect(result[0].checksum).toEqual(
    "e2d0fe1585a63ec6009c8016ff8dda8b17719a637405a4e23c0ff81339148249"
  )
})

test("returns correct number of results", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])
  const file: File = new File([blob], "")

  const result = await extractFileMetadata([file, file, file])
  expect(result).toHaveLength(3)
})

test("returns the correct file size", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])

  const result = await extractFileMetadata([new File([blob], "")])
  expect(result[0].size).toEqual(19)
})

test("returns the correct last modified date", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])

  const result = await extractFileMetadata([
    new File([blob], "", { lastModified: 1584027654000 })
  ])
  expect(result[0].lastModified).toEqual(new Date("2020-03-12T15:40:54.000Z"))
})

test("returns the correct path", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])
  const file = new File([blob], "")
  Object.defineProperty(file, "webkitRelativePath", { value: "/a/path" })
  const result = await extractFileMetadata([file])
  expect(result[0].path).toEqual("/a/path")
})

test("calls the callback function correctly", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])
  const file = new File([blob], "")
  const callback = jest.fn()
  const totalFiles = 2
  await extractFileMetadata([file, file], callback, 10)
  const calls = callback.mock.calls
  expect(calls).toHaveLength(6)
  const expectedResults = [
    [0, 25],
    [0, 50],
    [1, 50],
    [1, 75],
    [1, 100],
    [2, 100]
  ]

  checkCallbackFunctionCalls(calls, expectedResults)
})

test("calls the callback function correctly for two differently sized files", async () => {
  const blob = new Blob([new Uint8Array(fs.readFileSync("test/testfile"))])
  const file = new File([blob], "")
  const blobLonger = new Blob([
    new Uint8Array(fs.readFileSync("test/testfile"))
  ])
  const fileLonger = new File([blobLonger], "")
  const callback = jest.fn()
  const totalFiles = 2
  await extractFileMetadata([file, fileLonger], callback, 5)
  const calls = callback.mock.calls

  expect(calls).toHaveLength(10)
  const expectedResults = [
    [0, 13],
    [0, 25],
    [0, 38],
    [0, 50],
    [1, 50],
    [1, 63],
    [1, 75],
    [1, 88],
    [1, 100],
    [2, 100]
  ]
  checkCallbackFunctionCalls(calls, expectedResults)
})

const checkCallbackFunctionCalls: (
  calls: any[],
  expectedResults: number[][]
) => void = (calls, expectedResults) => {
  const totalFiles = 2
  for (let i = 0; i < calls.length; i += 1) {
    const processedFiles = expectedResults[i][0]
    const percentageProcessed = expectedResults[i][1]
    const expectedResult = { totalFiles, processedFiles, percentageProcessed }
    expect(calls[i][0]).toStrictEqual(expectedResult)
  }
}
