import { VertexTraverser, World } from "mogwai-ecs/lib"

import { GameSystem } from "@/GameSystem"

import { Description } from "@/components/Description"
import { Position } from "@/components/Position"
import ROT, { Display } from "rot-js"

import { InputManager, InputState } from "@/managers/InputManager"

export class WorldMap implements GameSystem {
    public static NAME: string = "world"

    private showFullNames: boolean = true

    public register(world: World): void {
        world.registerSystem(WorldMap.NAME, this)
        world.registerComponent(WorldMap.NAME + "/location")
    }

    public build(world: World): void {
        const city = (name: string, x: number, y: number) => {
            world.entity()
                .with("world/location")
                .with("position", new Position(x, y))
                .with("description", new Description(name))
                .close()
        }

        const site = (name: string, x: number, y: number) => {
            world.entity()
                .with("world/location")
                .with("position", new Position(x, y))
                .with("description", new Description(name))
                .close()
        }

        city("San Francisco", 4, 8)
        city("Arkham", 10, 8)
        city("Buenos Aires", 9, 18)

        city("London", 15, 7)
        city("Rome", 17, 10)
        city("Istanbul", 21, 9)

        city("Tokyo", 31, 10)
        city("Shanghai", 29, 12)
        city("Sydney", 30, 19)

        site("The Amazon", 11, 14)
        site("Tunguska", 26, 7)
        site("The Himalayas", 25, 10)
        site("The Pyramids", 20, 12)
        site("The Heart Of Africa", 19, 16)
        site("Antarctica", 20, 22)

        city("1", 3, 6)
        city("2", 2, 10)
        city("3", 4, 18)
        city("4", 6, 6)
        city("5", 7, 8)
        city("13", 20, 4)
    }

    public draw(world: World, display: Display): void {
        world.fetch()
            .on((t: VertexTraverser) => t.hasLabel("world/location"))
            .withComponents("position", "description")
            .stream()
            .each((value: {
                entity: number, position: Position, description: Description
            }) => {
                const text = this.showFullNames ? value.description.description : "x"
                const x = value.position.x * 3
                const y = value.position.y * 2
                display.draw(x, y, text)
            })
    }

    public execute(world: World): void {
        const inputMgr = world.fetch()
            .on((t: VertexTraverser) => t.hasLabel(InputManager.NAME))
            .withComponents(InputManager.NAME)
            .first()
        if (inputMgr) {
            const inputState: InputState = inputMgr[InputManager.NAME]
            if (inputState.pressed.get(ROT.VK_M)) {
                this.showFullNames = !this.showFullNames
            }
        }
    }
}
