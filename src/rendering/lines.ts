import { Position } from "@/components/Position"
import { RenderIterator } from "@/rendering"

export function render(from: Position, to: Position, overshoot: boolean = false): RenderIterator {
    let delta = { x: Math.abs(to.x - from.x), y: Math.abs(to.y - from.y) }
    const sign = { x: Math.sign(to.x - from.x), y: Math.sign(to.y - from.y) }

    let swap = false
    if (delta.y > delta.x) {
        delta = { x: delta.y, y: delta.x }
        swap = true
    }

    let d = 2.0 * delta.y - delta.x
    let index = 0
    const current = { ...from }
    let done = false

    return () => {
        if (done) {
            return undefined
        }

        const result = { ...current }
        if (!overshoot && index >= delta.x) {
            done = true
        } else {
            while (d > 0) {
                d -= 2 * delta.x
                if (swap) {
                    current.x += sign.x
                } else {
                    current.y += sign.y
                }
            }
            d += 2 * delta.y
            if (swap) {
                current.y += sign.y
            } else {
                current.x += sign.x
            }
        }
        index += 1
        return result
    }
}
