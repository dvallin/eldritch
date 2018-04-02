import { Game } from "@/Game"

import { Connections } from "@/systems/Connections"
import { Locations } from "@/systems/Locations"

import { findTravelPaths, travelTraversal } from "@/traversals/travel"

describe("Travel", () => {
    let game: Game
    let locations: Locations
    let connections: Connections
    beforeAll(() => {
        game = new Game()
        connections = new Connections()
        locations = new Locations()
        game.addGameSystem(connections)
        game.addGameSystem(locations)
        game.build()
    })

    describe("travelTraversal", () => {

        it("travels one step without tickets", () => {
            const targets = game.world.fetch(locations.location("London"))
                .on(t => travelTraversal(t, 0, 0))
                .withComponents("description")
                .collect()
                .map(t => t.description.description)
            expect(targets).toEqual(["Arkham", "London", "Rome"])
        })

        it("travels with train ticket", () => {
            const targets = game.world.fetch(locations.location("London"))
                .on(t => travelTraversal(t, 1, 0))
                .withComponents("description")
                .collect()
                .map(t => t.description.description)
            expect(targets).toEqual(["Arkham", "Rome", "Istanbul", "5", "6"])
        })

        it("travels with ship ticket", () => {
            const targets = game.world.fetch(locations.location("London"))
                .on(t => travelTraversal(t, 0, 1))
                .withComponents("description")
                .collect()
                .map(t => t.description.description)
            expect(targets).toEqual(["Arkham", "London", "Rome", "Istanbul", "The Pyramids", "5", "6", "8"])
        })

        it("travels with ship and train ticket", () => {
            const targets = game.world.fetch(locations.location("London"))
                .on(t => travelTraversal(t, 1, 1))
                .withComponents("description")
                .collect()
                .map(t => t.description.description)
            expect(targets).toEqual(["San Francisco", "Arkham", "London", "Rome", "Istanbul", "The Pyramids", "4", "5", "6", "8"])
        })
    })

    describe("findTravelPath", () => {

        it("travels one step without tickets", () => {
            const s = locations.location("2")!
            const a = locations.location("San Francisco")!

            const path = findTravelPaths(game.world, s, a, 0, 0)
            expect(path).toEqual([
                { path: [s, a], costOptions: [{ ship: 0, train: 0 }] }
            ])
        })

        it("cant reach longer without tickets", () => {
            const s = locations.location("2")!
            const c = locations.location("5")!

            const path = findTravelPaths(game.world, s, c, 0, 0)
            expect(path).toEqual([])
        })

        it("takes the direct path with tickets", () => {
            const s = locations.location("2")!
            const a = locations.location("San Francisco")!
            const c = locations.location("5")!

            const path = findTravelPaths(game.world, s, c, 0, 1)
            expect(path).toEqual([
                { path: [s, a, c], costOptions: [{ train: 0, ship: 1 }] }
            ])
        })

        it("takes the longer path with tickets", () => {
            const s = locations.location("2")!
            const a = locations.location("San Francisco")!
            const b1 = locations.location("7")!
            const b2 = locations.location("8")!
            const d = locations.location("Arkham")!

            const path = findTravelPaths(game.world, s, d, 0, 4)
            expect(path).toEqual([
                { path: [s, a, b1, b2, d], costOptions: [{ ship: 3, train: 0 }] }
            ])
        })

        it("finds all cheapest paths", () => {
            const s = locations.location("London")!
            const a = locations.location("Arkham")!
            const b = locations.location("5")!
            const c = locations.location("6")!
            const d = locations.location("San Francisco")!

            const path = findTravelPaths(game.world, s, d, 5, 5)
            expect(path).toEqual([
                {
                    path: [s, a, b, d], costOptions: [
                        { ship: 0, train: 2 },
                        { ship: 1, train: 1 }
                    ]
                },
                {
                    path: [s, a, c, d], costOptions: [
                        { ship: 0, train: 2 },
                        { ship: 1, train: 1 }]
                }
            ])
        })

        it("gives choices on how to spend tickets", () => {
            const s = locations.location("London")!
            const a = locations.location("Arkham")!
            const d = locations.location("5")!

            const path = findTravelPaths(game.world, s, d, 5, 5)
            expect(path).toEqual([
                {
                    path: [s, a, d], costOptions: [
                        { ship: 0, train: 1 },
                        { ship: 1, train: 0 }
                    ]
                },
            ])
        })
    })
})
