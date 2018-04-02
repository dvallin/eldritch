import { Edge, Search, Vertex, VertexTraverser, World } from "mogwai-ecs/lib"

interface PathCost {
    train: number
    ship: number
    walk: number
}

export interface CostOption {
    train: number
    ship: number
}

export interface TravelPath {
    path: Vertex[],
    costOptions: CostOption[]
}

export function findTravelPaths(
    w: World, from: number, to: number, train: number, ship: number, walk: number = 1
): TravelPath[] {
    const search = new Search(w.graph)
    const paths = search.paths(from, to,
        (node) => w.fetch(node).relationsFetch("bothE", f => f.bothE()).first().bothE
    )
    let bestPaths: TravelPath[] = []
    let currentPrice = (train + ship + 1)
    paths.forEach(edgePath => {
        const pathCost = aggregateCostsAlongPath(w, edgePath)
        const walkOffset = walk - pathCost.walk
        const price = pathCost.ship + pathCost.train - walkOffset
        if (price <= currentPrice) {
            const isWalkable = walkOffset >= 0
            const reachableWithTrainOffset =
                ((train + walkOffset) - pathCost.train >= 0) && (ship - pathCost.ship >= 0)
            const reachableWithShipOffset =
                ((ship + walkOffset) - pathCost.ship >= 0) && (train - pathCost.train >= 0)
            if (isWalkable && (reachableWithTrainOffset || reachableWithShipOffset)) {
                const vertexPath = edgePathToVertexPath(w, from, edgePath)
                const costOptions = calculateCostOptions(pathCost, reachableWithShipOffset, reachableWithTrainOffset, walkOffset)
                if (currentPrice !== price) {
                    bestPaths = []
                }
                bestPaths.push({
                    path: vertexPath,
                    costOptions
                })
                currentPrice = price
            }
        }
    })
    return bestPaths
}

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
            .matchesValue("connection", (v: { type: string }) => v.type === "train")
            .both()
            .as("a")
        snaps.push("a")
    }
    if (ship > 0) {
        t = t.from(`${train}-${ship - 1}-${walk}`)
            .bothE("connection")
            .matchesValue("connection", (v: { type: string }) => v.type === "ship")
            .both()
            .as("b")
        snaps.push("b")
    }
    if (walk > 0) {
        t = t.from(`${train}-${ship}-${walk - 1}`)
            .bothE("connection")
            .both()
            .as("c")
        snaps.push("c")
    }
    if (snaps.length > 0) {
        t = t.or(...snaps)
    }
    return t.as(`${train}-${ship}-${walk}`)
}

function aggregateCostsAlongPath(w: World, path: Edge[]): PathCost {
    const types: PathCost = { train: 0, ship: 0, walk: 0 }
    path.forEach(edge => {
        const e = w.graph.getEdge(edge, "connection").connection as { type: string }
        switch (e.type) {
            case "ship":
                types.ship += 1
                break
            case "train":
                types.train += 1
                break
            default:
                types.walk += 1
        }
    })
    return types
}

function calculateCostOptions(
    pathCost: PathCost, reachableWithShipOffset: boolean, reachableWithTrainOffset: boolean, walkOffset: number
): CostOption[] {
    const costOptions: CostOption[] = []
    if (reachableWithShipOffset) {
        const proposedShipTicketUsage = pathCost.ship - walkOffset
        if (proposedShipTicketUsage >= 0) {
            costOptions.push({
                ship: proposedShipTicketUsage,
                train: pathCost.train
            })
        }
    }
    if (reachableWithTrainOffset) {
        const proposedTrainTicketUsage = pathCost.train - walkOffset
        if (proposedTrainTicketUsage >= 0) {
            costOptions.push({
                ship: pathCost.ship,
                train: proposedTrainTicketUsage
            })
        }
    }
    return costOptions
}

function edgePathToVertexPath(w: World, from: Vertex, path: Edge[]): Vertex[] {
    let current = from
    const vertexPath: Vertex[] = [from]
    path.forEach(edge => {
        let [v0, v1]: Vertex[] = w.graph.E(edge).both().toList()
        if (v1 === current) {
            [v1, v0] = [v0, v1]
        }
        current = v1
        vertexPath.push(v1)
    })
    return vertexPath
}
