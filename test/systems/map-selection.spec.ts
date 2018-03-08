import { Game } from "@/Game"

import { Locations } from "@/systems/Locations"

import { Input } from "@/systems/Input"

import { DetailView } from "@/systems/DetailView"

describe("World Map", () => {
    let game: Game
    let input: Input
    let detailView: DetailView
    let locations: Locations
    let draw: jest.SpyInstance<{}>
    beforeEach(() => {
        game = new Game()
        input = new Input(game.display.eventToPosition)
        draw = jest.spyOn(game.display, "draw")
        detailView = new DetailView()
        locations = new Locations()
        game.addGameSystem(input)
        game.addGameSystem(detailView)
        game.addGameSystem(locations)
        game.build()
    })

    it("selects arkham", () => {
        input.mousePressed = jest.fn().mockReturnValue(true)
        input.mouse.x = 30
        input.mouse.y = 16
        const select = jest.spyOn(detailView, "select")
        game.tick()
        expect(select).toHaveBeenCalledWith(locations.location("Arkham"))
    })
})

