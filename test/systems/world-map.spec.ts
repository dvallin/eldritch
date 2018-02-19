import { Game } from "@/Game"

import { WorldMap } from "@/systems/WorldMap"

import { expectCanvas } from "../test-utils/expect-canvas"
import { requestAnimationFrame } from "../test-utils/request-animation-frame"

describe("World Map", () => {

    let game: Game
    beforeEach(() => {
        game = new Game()
    })

    it("renders cities", async () => {
        game.addGameSystem(new WorldMap())
        game.build()

        // when
        game.tick()
        await requestAnimationFrame()

        // then
        expectCanvas(game.display).toMatchImageSnapshot()
    })
})

