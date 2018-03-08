import { Game } from "@/Game"

import { Connections } from "@/systems/Connections"
import { Investigators } from "@/systems/Investigators"
import { Locations } from "@/systems/Locations"

import { Input } from "@/systems/Input"

import { toArray } from "@/rendering"
import { render } from "@/rendering/lines"

import { Position } from "@/components/Position"

describe("World Map", () => {

  const arkham: Position = { x: 30, y: 16 }
  const london: Position = { x: 45, y: 14 }
  const five: Position = { x: 21, y: 16 }
  const three: Position = { x: 12, y: 36 }
  const sydney: Position = { x: 90, y: 38 }

  let game: Game
  let input: Input
  let draw: jest.SpyInstance<{}>
  beforeEach(() => {
    game = new Game()
    input = new Input(game.display.eventToPosition)
    draw = jest.spyOn(game.display, "draw")

    game.addGameSystem(input)
    game.addGameSystem(new Locations())
    game.addGameSystem(new Connections())
    game.addGameSystem(new Investigators())
    game.build()
  })

  it("renders cities", () => {
    game.tick()
    expect(draw).toHaveBeenCalledWith(arkham.x, arkham.y, "x", "red")
  })

  it("renders seas", () => {
    game.tick()
    expect(draw).toHaveBeenCalledWith(6, 20, "x", "blue")
  })

  it("renders sites", () => {
    game.tick()
    expect(draw).toHaveBeenCalledWith(33, 28, "x", "green")
  })

  it("renders full city names", () => {
    input.pressed = jest.fn().mockReturnValue(true)
    game.tick()
    expect(draw).toHaveBeenCalledWith(arkham.x, arkham.y, "Arkham", "red")
  })

  it("renders roads", () => {
    input.pressed = jest.fn().mockReturnValue(true)
    game.tick()
    const line = toArray(render({ x: 9, y: 12 }, { x: 18, y: 12 })).slice(1, 9)
    line.forEach(pos => {
      expect(draw).toHaveBeenCalledWith(pos.x, pos.y, ".", "red")
    })
  })

  it("renders ships", () => {
    input.pressed = jest.fn().mockReturnValue(true)
    game.tick()
    const line = toArray(render(arkham, london)).slice(1, 15)
    line.forEach(pos => {
      expect(draw).toHaveBeenCalledWith(pos.x, pos.y, ".", "blue")
    })
  })

  it("renders railroads", () => {
    input.pressed = jest.fn().mockReturnValue(true)
    game.tick()
    const line = toArray(render(arkham, five)).slice(1, 9)
    line.forEach(pos => {
      expect(draw).toHaveBeenCalledWith(pos.x, pos.y, ".", "green")
    })
  })

  it("wraps connections around the globe", () => {
    input.pressed = jest.fn().mockReturnValue(true)
    game.tick()
    let line = toArray(render(three, { x: 0, y: three.y + 1 })).slice(1, 12)
    line.forEach(pos => {
      expect(draw).toHaveBeenCalledWith(pos.x, pos.y, ".", "blue")
    })
    line = toArray(render({ x: 99, y: three.y + 1 }, sydney)).slice(1, 9)
    line.forEach(pos => {
      expect(draw).toHaveBeenCalledWith(pos.x, pos.y, ".", "blue")
    })
  })
})

