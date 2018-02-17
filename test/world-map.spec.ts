import { Game } from "@/Game"
import { WorldMap } from "@/WorldMap"

import { expectCanvas } from "./test-utils/expect-canvas"
import { requestAnimationFrame } from "./test-utils/request-animation-frame"

describe("World Map", () => {

    let game: Game
    beforeEach(() => {
        game = new Game()
        game.init()
    })

    it("renders cities", async () => {
        new WorldMap()
            .build(game)

        // when
        game.draw()
        await requestAnimationFrame()

        // then
        expectCanvas(game.display).toMatchImageSnapshot()
    })
})

