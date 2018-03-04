import { Position } from "@/components/Position"
import { toStream } from "@/rendering"
import { render } from "@/rendering/lines"

describe("lines", () => {
  it("renders a single pixel if from equals to", () => {
    const p: Position = { x: 0, y: 0 }
    expect(toStream(render(p, p)).toArray()).toEqual([p])
  })

  it("renders a infinite pixels if from equals to and overshoot", () => {
    const p: Position = { x: 0, y: 0 }
    const iter = render(p, p, true)
    expect(iter()).toEqual(p)
    expect(iter()).toEqual(p)
  })

  it("renders along the positive x axis", () => {
    const from: Position = { x: 0, y: 0 }
    const to: Position = { x: 2, y: 0 }
    expect(toStream(render(from, to)).toArray()).toEqual(
      [from, { x: 1, y: 0 }, to]
    )
  })

  it("renders along the positive x axis and overshoots", () => {
    const from: Position = { x: 0, y: 0 }
    const to: Position = { x: 2, y: 0 }
    const iter = render(from, to, true)
    expect(iter()).toEqual(from)
    expect(iter()).toEqual({ x: 1, y: 0 })
    expect(iter()).toEqual(to)
    expect(iter()).toEqual({ x: 3, y: 0 })
  })

  it("renders along the negative x axis", () => {
    const from: Position = { x: 0, y: 0 }
    const to: Position = { x: -2, y: 0 }
    expect(toStream(render(from, to)).toArray()).toEqual(
      [from, { x: -1, y: 0 }, to]
    )
  })

  it("renders along the negative x axis and overshoots", () => {
    const from: Position = { x: 0, y: 0 }
    const to: Position = { x: -1, y: 0 }
    const iter = render(from, to, true)
    expect(iter()).toEqual(from)
    expect(iter()).toEqual(to)
    expect(iter()).toEqual({ x: -2, y: 0 })
    expect(iter()).toEqual({ x: -3, y: 0 })
  })

  it("renders along the positive y axis", () => {
    const from: Position = { x: 0, y: 0 }
    const to: Position = { x: 0, y: 2 }
    expect(toStream(render(from, to)).toArray()).toEqual(
      [from, { x: 0, y: 1 }, to]
    )
  })

  it("renders along the negative y axis", () => {
    const from: Position = { x: 0, y: 0 }
    const to: Position = { x: 0, y: -2 }
    expect(toStream(render(from, to)).toArray()).toEqual(
      [from, { x: 0, y: -1 }, to]
    )
  })

  it("renders very steep", () => {
    const from: Position = { x: 0, y: 0 }
    const to: Position = { x: 1, y: -10 }
    const line = toStream(render(from, to)).toArray()
    expect(line).toHaveLength(11)
    expect(line[0]).toEqual(from)
    expect(line[5].x).toBe(0)
    expect(line[6].x).toBe(1)
    expect(line[10]).toEqual(to)
  })

  it("renders very flat", () => {
    const from: Position = { x: 0, y: 0 }
    const to: Position = { x: -10, y: 1 }
    const line = toStream(render(from, to)).toArray()
    expect(line).toHaveLength(11)
    expect(line[0]).toEqual(from)
    expect(line[5].y).toBe(0)
    expect(line[6].y).toBe(1)
    expect(line[10]).toEqual(to)
  })
})

