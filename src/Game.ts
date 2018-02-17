import ROT, { Display } from "rot-js"

import { VertexTraverser, World } from "mogwai-ecs/lib"

import { Position } from "./components/Position"
import { Tile } from "./components/Tile"

export class Game {
    public display: Display
    public world: World

    constructor() {
        this.display = new ROT.Display()
        this.world = new World()
    }

    public init(): void {
        document.body.appendChild(this.display.getContainer())
    }

    public draw(): void {
        this.world.fetch()
            .on((t: VertexTraverser) => t.hasLabel("tile"))
            .withComponents("position", "tile")
            .stream()
            .each((value: {
                entity: number, position: Position, tile: Tile
            }) => {
                this.display.draw(value.position.x, value.position.y, value.tile.character)
            })
    }
}
