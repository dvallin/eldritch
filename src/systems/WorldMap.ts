import { VertexTraverser, World } from "mogwai-ecs/lib"
import ROT, { Display } from "rot-js"

import { GameSystem } from "@/systems/GameSystem"
import { Input } from "@/systems/Input"

import { Description } from "@/components/Description"
import { Position } from "@/components/Position"

import { toArray } from "@/rendering"
import { render } from "@/rendering/lines"

export class WorldMap implements GameSystem {
    public static NAME: string = "world"

    private showFullNames: boolean = false

    public register(world: World): void {
        world.registerSystem(WorldMap.NAME, this)
        world.registerComponent(WorldMap.NAME + "/location")
        world.registerRelation(WorldMap.NAME + "/road")
    }

    public build(world: World): void {
        const locations: { [name: string]: number } = {}

        const city = (name: string, x: number, y: number): void => {
            locations[name] = world.entity()
                .with("world/location")
                .with("position", new Position(x, y))
                .with("description", new Description(name))
                .close()
        }

        const site = (name: string, x: number, y: number): void => {
            locations[name] = world.entity()
                .with("world/location")
                .with("position", new Position(x, y))
                .with("description", new Description(name))
                .close()
        }

        const road = (from: number, to: number): void => {
            world.relation()
                .from(from)
                .to(to)
                .with("world/road")
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

        road(locations["San Francisco"], locations["1"])
        road(locations["San Francisco"], locations["2"])
        road(locations["San Francisco"], locations["5"])
        road(locations["4"], locations["1"])
        road(locations["4"], locations["5"])
        road(locations["5"], locations.Arkham)
        road(locations.London, locations.Arkham)
        road(locations.London, locations.Rome)
        road(locations.Rome, locations.Istanbul)
        road(locations.Istanbul, locations["The Pyramids"])
        road(locations["The Heart Of Africa"], locations["The Pyramids"])
        road(locations.Sydney, locations.Antarctica)
        road(locations.Tokyo, locations.Shanghai)
        road(locations.Shanghai, locations["The Himalayas"])
        road(locations["3"], locations["Buenos Aires"])
        // road(locations["3"], locations.Sydney)
    }

    public draw(world: World, display: Display): void {
        world.fetch()
            .on((t: VertexTraverser) => t.hasLabel("world/location"))
            .withComponents("position", "description")
            .subFetch("roads", (t: VertexTraverser) => t.out("world/road"), "position")
            .stream()
            .each((value: {
                entity: number, position: Position, description: Description,
                roads: [{ entity: number, position: Position }]
            }) => {
                const text = this.showFullNames ? value.description.description : "x"
                const displayPosition = { x: value.position.x * 3, y: value.position.y * 2 }
                value.roads.forEach(other => {
                    const otherDisplayPosition = { x: other.position.x * 3, y: other.position.y * 2 }
                    const line = toArray(render(displayPosition, otherDisplayPosition))
                    line.slice(1, line.length - 1)
                        .forEach(position => {
                            display.draw(position.x, position.y, ".")
                        })
                })
                display.draw(displayPosition.x, displayPosition.y, text)

            })
    }

    public execute(world: World): void {
        const inputMgr: Input = world.systems.get(Input.NAME) as Input
        if (inputMgr && inputMgr.pressed(ROT.VK_M)) {
            this.showFullNames = !this.showFullNames
        }
    }
}
