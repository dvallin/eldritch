import { Game } from "@/Game"

import { Connections } from "@/systems/Connections"
import { DetailView } from "@/systems/DetailView"
import { Input } from "@/systems/Input"
import { Investigators } from "@/systems/Investigators"
import { Locations } from "@/systems/Locations"

describe("Inspector", () => {
    let game: Game
    let investigators: Investigators
    let input: Input
    let detailView: DetailView
    beforeEach(() => {
        game = new Game()
        investigators = new Investigators()
        input = new Input(game.display.eventToPosition)
        detailView = new DetailView()
        game.addGameSystem(new Locations())
        game.addGameSystem(new Connections())
        game.addGameSystem(investigators)
        game.addGameSystem(input)
        game.addGameSystem(detailView)
        game.build()
    })


    it("travels when action is clicked", () => {
        // when
        input.mousePressed = jest.fn().mockReturnValue(true)
        input.mouse.y = 2

        detailView.execute(game.world)
        detailView.render(game.world, game.display)

        // then
        const newLocation = game.world.fetch(investigators.investigator("Dr. A"))
            .on(t => t.out("isAt"))
            .withComponents("description")
            .first()
        expect(newLocation).toEqual({ description: { description: "London" }, entity: 3 })
    })

})

