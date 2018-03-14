import { Game } from "@/Game"

import { Input } from "@/systems/Input"
import { Investigators } from "@/systems/Investigators"
import { Locations } from "@/systems/Locations"
import { Turns } from "@/systems/Turns"
import { VK_ENTER } from "rot-js"

describe("turns", () => {
    let game: Game
    let investigators: Investigators
    let turns: Turns
    let input: Input
    beforeEach(() => {
        game = new Game()
        investigators = new Investigators()
        turns = new Turns()
        input = new Input(game.display.eventToPosition)
        game.addGameSystem(turns)
        game.addGameSystem(investigators)
        game.addGameSystem(input)
        game.addGameSystem(new Locations())
        game.build()
    })

    it("starts with all investigators waiting turn", () => {
        const waiting = game.world.fetch()
            .on(t => t.hasLabel("investigator").hasLabel("waitTurn"))
            .collect()
        expect(waiting).toHaveLength(2)
    })

    it("takes leader into turn first", () => {
        turns.execute(game.world)
        const inTurn = game.world.fetch()
            .on(t => t.hasLabel("leader").hasLabel("inTurn"))
            .collect()
        const waiting = game.world.fetch()
            .on(t => t.hasLabel("waitTurn"))
            .collect()
        expect(waiting).toHaveLength(1)
        expect(inTurn).toHaveLength(1)
    })

    it("activates the next player waiting for turn and puts players into took turn", () => {
        input.isPressed = jest.fn().mockImplementation((vkCode: number) => vkCode === VK_ENTER)
        turns.execute(game.world)
        const tookTurn = game.world.fetch()
            .on(t => t.hasLabel("tookTurn"))
            .collect()
        const inTurn = game.world.fetch()
            .on(t => t.hasLabel("inTurn"))
            .collect()
        const waiting = game.world.fetch()
            .on(t => t.hasLabel("waitTurn"))
            .collect()
        expect(waiting).toHaveLength(0)
        expect(inTurn).toHaveLength(1)
        expect(tookTurn).toHaveLength(1)
    })

    it("puts everyone into waiting if everyone took turn", () => {
        input.isPressed = jest.fn().mockImplementation((vkCode: number) => vkCode === VK_ENTER)
        turns.execute(game.world)
        turns.execute(game.world)
        const tookTurn = game.world.fetch()
            .on(t => t.hasLabel("tookTurn"))
            .collect()
        const waiting = game.world.fetch()
            .on(t => t.hasLabel("waitTurn"))
            .collect()
        const inTurn = game.world.fetch()
            .on(t => t.hasLabel("inTurn"))
            .collect()
        expect(waiting).toHaveLength(2)
        expect(inTurn).toHaveLength(0)
        expect(tookTurn).toHaveLength(0)
    })

    it("starts over with leader after a full turn", () => {
        input.isPressed = jest.fn().mockImplementation((vkCode: number) => vkCode === VK_ENTER)
        turns.execute(game.world)
        turns.execute(game.world)
        turns.execute(game.world)
        const tookTurn = game.world.fetch()
            .on(t => t.hasLabel("tookTurn"))
            .collect()
        const waiting = game.world.fetch()
            .on(t => t.hasLabel("waitTurn"))
            .collect()
        const inTurn = game.world.fetch()
            .on(t => t.hasLabel("inTurn"))
            .collect()
        expect(waiting).toHaveLength(0)
        expect(inTurn).toHaveLength(1)
        expect(tookTurn).toHaveLength(1)
    })
})
