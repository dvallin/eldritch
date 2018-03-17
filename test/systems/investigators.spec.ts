import { Game } from "@/Game"

import { Connections } from "@/systems/Connections"
import { DetailView } from "@/systems/DetailView"
import { Input } from "@/systems/Input"
import { Investigators } from "@/systems/Investigators"
import { Locations } from "@/systems/Locations"

describe("Investigators", () => {
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

    it("creates exactly one leader", () => {
        const leaders = game.world.fetch().on(t => t.hasLabel("leader")).collect()
        expect(leaders).toHaveLength(1)
    })

    it("activates exactly one", () => {
        const leaders = game.world.fetch().on(t => t.hasLabel("active")).collect()
        expect(leaders).toHaveLength(1)
    })

    it("activates the leader", () => {
        const leaders = game.world.fetch().on(t => t.hasLabel("leader").hasLabel("active")).collect()
        expect(leaders).toHaveLength(1)
    })

    it("awaits input when travel action is clicked and travels on location selection", () => {
        // when
        input.mousePressed = jest.fn().mockReturnValue(true)
        input.mouse.y = 2

        game.tick()

        input.mousePressed = jest.fn().mockReturnValue(true)
        input.mouse.x = 45
        input.mouse.y = 14

        game.tick()

        // then
        const newLocation = game.world.fetch(investigators.investigator("Norman Whithers"))
            .on(t => t.out("isAt"))
            .withComponents("description")
            .first()
        expect(newLocation).toEqual({ description: { description: "London" }, entity: 3 })
    })

})

