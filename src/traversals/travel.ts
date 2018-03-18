import { VertexTraverser } from "mogwai-ecs/lib"

export function travelTraversal(t: VertexTraverser, train: number, ship: number, walk: number = 1): VertexTraverser {
    if (t.vertexSnapshots.has(`${train}-${ship}-${walk}`)) {
        return t
    }
    t.as("start")
    if (train > 0) {
        t = travelTraversal(t.from("start"), train - 1, ship, walk)
    }
    if (ship > 0) {
        t = travelTraversal(t.from("start"), train, ship - 1, walk)
    }
    if (walk > 0) {
        t = travelTraversal(t.from("start"), train, ship, walk - 1)
    }
    const snaps = []
    if (train > 0) {
        t = t.from(`${train - 1}-${ship}-${walk}`)
            .bothE("connection")
            .matchesValue("connection", (v: { type: string }) => {
                return v.type === "train"
            })
            .both()
            .as("a")
        snaps.push("a")
    }
    if (ship > 0) {
        t = t.from(`${train}-${ship - 1}-${walk}`)
            .bothE("connection")
            .matchesValue("connection", (v: { type: string }) => {
                return v.type === "ship"
            })
            .both()
            .as("b")
        snaps.push("b")
    }
    if (walk > 0) {
        t = t.from(`${train}-${ship}-${walk - 1}`)
            .both("connection")
            .as("c")
        snaps.push("c")
    }
    if (snaps.length > 0) {
        t = t.or(...snaps)
    }
    return t.as(`${train}-${ship}-${walk}`)
}
