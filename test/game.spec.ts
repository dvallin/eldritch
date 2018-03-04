import { Game } from "@/Game"

describe("Game", () => {
  it("locks onto a fixed framerate", () => {
    jest.useFakeTimers()
    const game: Game = new Game({
      framerate: 10
    })
    const spy = jest.spyOn(game, "run")
    game.tick = jest.fn()

    game.run()
    jest.advanceTimersByTime(100)
    jest.advanceTimersByTime(100)
    jest.advanceTimersByTime(100)
    jest.advanceTimersByTime(100)
    jest.advanceTimersByTime(100)
    jest.advanceTimersByTime(100)
    jest.advanceTimersByTime(100)

    expect(spy).toHaveBeenCalledTimes(8)
  })
})
