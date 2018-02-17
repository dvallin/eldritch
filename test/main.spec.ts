import { Game } from "@/Game"
import { Display, RNG } from "rot-js"

/// <reference path="../types/jest-image-snapshot.d.ts" />
import { toMatchImageSnapshot } from "jest-image-snapshot"

expect.extend({ toMatchImageSnapshot })

function requestAnimationFrame(): Promise<number> {
    return new Promise((resolve) => {
        window.requestAnimationFrame((time: number) =>
            resolve(time)
        )
    })
}

function canvasToBuffer(canvas: HTMLCanvasElement): Buffer {
    const dataUrl: string = canvas.toDataURL("image/png")
    const data = dataUrl.substring("data:image/png;base64,".length)
    return new Buffer(data, "base64")
}

function extractCanvas(display: Display): HTMLCanvasElement {
    return display.getContainer() as HTMLCanvasElement
}

describe("main", () => {

    it("renders", async () => {
        // given
        RNG.setSeed(0)
        const game: Game = new Game()
        game.init()

        // when
        await requestAnimationFrame()

        // then
        const canvas: HTMLCanvasElement = extractCanvas(game.display)
        expect(canvasToBuffer(canvas)).toMatchImageSnapshot()
    })

})
