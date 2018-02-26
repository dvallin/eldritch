import { Game } from "@/Game"

import { Connections } from "@/systems/Connections"
import { Investigators } from "@/systems/Investigators"
import { Locations } from "@/systems/Locations"

import { Input } from "@/systems/Input"
import { expectCanvas } from "../test-utils/expect-canvas"
import { requestAnimationFrame } from "../test-utils/request-animation-frame"

describe("World Map", () => {

    let game: Game
    let input: Input
    beforeEach(() => {
        game = new Game()
        input = new Input()
        game.addGameSystem(input)
    })

    it("renders cities", async () => {
        game.addGameSystem(new Locations())
        game.addGameSystem(new Connections())
        game.addGameSystem(new Investigators())
        game.build()

        // when
        game.tick()
        await requestAnimationFrame()

        // then
        expectCanvas(game.display).toMatchImageSnapshot()
    })

    it("renders full city names", async () => {
        game.addGameSystem(new Locations())
        game.addGameSystem(new Connections())
        game.build()
        input.pressed = jest.fn().mockReturnValue(true)

        // when
        game.tick()
        await requestAnimationFrame()

        // then
        expectCanvas(game.display).toMatchImageSnapshot()
    })
})

