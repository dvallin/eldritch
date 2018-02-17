import { Game } from "@/Game"
import { VectorStorage } from "mogwai-ecs/lib"

import { Description } from "@/components/Description"
import { Position } from "@/components/Position"
import { Tile } from "@/components/Tile"

export class WorldMap {

    public build(game: Game): void {
        game.world.registerComponent("tile", new VectorStorage<Tile>())
        game.world.registerComponent("position", new VectorStorage<Position>())
        game.world.registerComponent("description", new VectorStorage<Description>())

        const addCity = (name: string, x: number, y: number) =>
            game.world.entity()
                .with("position", new Position(x, y))
                .with("tile", new Tile("x"))
                .with("description", new Description(name))
                .close()

        addCity("1", 1, 1)
        addCity("2", 3, 6)
        addCity("3", 2, 20)
        addCity("4", 7, 2)
        addCity("5", 8, 4)
    }

}
