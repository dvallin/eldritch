import { Display } from "rot-js"

/// <reference path="../types/jest-image-snapshot.d.ts" />
import { toMatchImageSnapshot } from "jest-image-snapshot"

expect.extend({ toMatchImageSnapshot })

function canvasToBuffer(canvas: HTMLCanvasElement): Buffer {
    const dataUrl: string = canvas.toDataURL("image/png")
    const data = dataUrl.substring("data:image/png;base64,".length)
    return new Buffer(data, "base64")
}

export function expectCanvas(display: Display): jest.Matchers<void> {
    const canvas: HTMLCanvasElement = display.getContainer() as HTMLCanvasElement
    return expect(canvasToBuffer(canvas))
}
