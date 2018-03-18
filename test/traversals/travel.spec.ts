import { Game } from "@/Game"

import { Connections } from "@/systems/Connections"
import { Locations } from "@/systems/Locations"

import { travelTraversal } from "@/traversals/travel"

describe("Travel", () => {
    let game: Game
    let locations: Locations
    let connections: Connections
    beforeEach(() => {
        game = new Game()
        connections = new Connections()
        locations = new Locations()
        game.addGameSystem(connections)
        game.addGameSystem(locations)
        game.build()
    })

    it("travels one step without tickets", () => {
        const targets = game.world.fetch(locations.location("London"))
            .on(t => travelTraversal(t, 0, 0))
            .withComponents("description")
            .collect()
            .map(t => t.description.description)
        expect(targets).toEqual(["Arkham", "Rome"])
    })

    it("travels with train ticket", () => {
        const targets = game.world.fetch(locations.location("London"))
            .on(t => travelTraversal(t, 1, 0))
            .withComponents("description")
            .collect()
            .map(t => t.description.description)
        expect(targets).toEqual(["Arkham", "Rome", "Istanbul", "5"])
    })

    it("travels with ship ticket", () => {
        const targets = game.world.fetch(locations.location("London"))
            .on(t => travelTraversal(t, 0, 1))
            .withComponents("description")
            .collect()
            .map(t => t.description.description)
        expect(targets).toEqual(["Arkham", "London", "Rome", "Istanbul", "The Pyramids", "5"])
    })

    it("travels with ship and train ticket", () => {
        const targets = game.world.fetch(locations.location("London"))
            .on(t => travelTraversal(t, 1, 1))
            .withComponents("description")
            .collect()
            .map(t => t.description.description)
        expect(targets).toEqual(["San Francisco", "Arkham", "London", "Rome", "Istanbul", "The Pyramids", "4", "5"])
    })
})
