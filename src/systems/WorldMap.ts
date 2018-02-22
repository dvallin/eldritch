import { VectorStorage, VertexTraverser, World } from "mogwai-ecs/lib"
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
        world.registerComponent("location", new VectorStorage())
        world.registerRelation("connection", new VectorStorage())
    }

    public build(world: World): void {
        const locations: { [name: string]: number } = {}

        const city = (name: string, x: number, y: number): void => {
            locations[name] = world.entity()
                .with("location", { type: "city" })
                .with("position", new Position(x, y))
                .with("description", new Description(name))
                .close()
        }

        const sea = (name: string, x: number, y: number): void => {
            locations[name] = world.entity()
                .with("location", { type: "sea" })
                .with("position", new Position(x, y))
                .with("description", new Description(name))
                .close()
        }

        const site = (name: string, x: number, y: number): void => {
            locations[name] = world.entity()
                .with("location", { type: "site" })
                .with("position", new Position(x, y))
                .with("description", new Description(name))
                .close()
        }

        const road = (from: number, to: number): void => {
            world.relation()
                .from(from)
                .to(to)
                .with("connection", { type: "road" })
                .close()
        }

        const train = (from: number, to: number): void => {
            world.relation()
                .from(from)
                .to(to)
                .with("connection", { type: "train" })
                .close()
        }

        const ship = (from: number, to: number): void => {
            world.relation()
                .from(from)
                .to(to)
                .with("connection", { type: "ship" })
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
        sea("Antarctica", 20, 22)

        city("1", 3, 6)
        sea("2", 2, 10)
        sea("3", 4, 18)
        city("4", 6, 6)
        city("5", 7, 8)
        city("13", 20, 4)

        ship(locations["San Francisco"], locations["1"])
        ship(locations["San Francisco"], locations["2"])
        train(locations["San Francisco"], locations["5"])
        road(locations["4"], locations["1"])
        road(locations["4"], locations["5"])
        train(locations["5"], locations.Arkham)
        ship(locations.London, locations.Arkham)
        ship(locations.London, locations.Rome)
        ship(locations.Rome, locations["The Pyramids"])
        train(locations.Rome, locations.Istanbul)
        train(locations.Istanbul, locations["The Pyramids"])
        road(locations["The Heart Of Africa"], locations["The Pyramids"])
        ship(locations.Sydney, locations.Antarctica)
        ship(locations.Tokyo, locations.Shanghai)
        road(locations.Shanghai, locations["The Himalayas"])
        ship(locations["3"], locations["Buenos Aires"])
        road(locations["3"], locations.Sydney)
    }

    public draw(world: World, display: Display): void {
        world.fetch()
            .on((t: VertexTraverser) => t.hasLabel("location"))
            .withComponents("position", "description", "location")
            .relationsFetch("connections", (t: VertexTraverser) => t.outE("connection"), "connection")
            .subFetch("roads", (t: VertexTraverser) => t.out("connection"), "position")
            .stream()
            .each((value: {
                entity: number, position: Position, description: Description,
                location: { type: string }
                roads: [{ entity: number, position: Position }]
                connections: [{ relation: number, other: number, "connection": { type: string } }]
            }) => {
                const displayPosition = { x: value.position.x * 3, y: value.position.y * 2 }
                value.roads.forEach((other, index) => {
                    const otherDisplayPosition = { x: other.position.x * 3, y: other.position.y * 2 }
                    const type = value.connections[index].connection.type
                    this.renderConnection(display, type, displayPosition, otherDisplayPosition)
                })
                this.renderLocation(display, value.location.type, value.description.description, displayPosition)
            })
    }

    public execute(world: World): void {
        const inputMgr: Input = world.systems.get(Input.NAME) as Input
        if (inputMgr && inputMgr.pressed(ROT.VK_M)) {
            this.showFullNames = !this.showFullNames
        }
    }

    private renderLocation(display: Display, type: string, description: string, pos: Position): void {
        let color: string
        if (type === "city") {
            color = "red"
        } else if (type === "sea") {
            color = "blue"
        } else if (type === "site") {
            color = "green"
        } else {
            return
        }
        const text = this.showFullNames ? description : "x"
        display.draw(pos.x, pos.y, text, color)
    }

    private renderConnection(display: Display, type: string, from: Position, to: Position): void {
        let color: string
        if (type === "road") {
            color = "red"
        } else if (type === "ship") {
            color = "blue"
        } else if (type === "train") {
            color = "green"
        } else {
            return
        }

        let p0 = from
        let p1 = to
        if (from.x > to.x) {
            p0 = to
            p1 = from
        }

        if (p1.x + 20 > display.getOptions().width! && p0.x - 20 < 0) {
            const y2 = (p0.y + p1.y) / 2

            const line1 = toArray(render(p0, { x: 0, y: y2 }))
            const line2 = toArray(render({ x: display.getOptions().width! - 1, y: y2 }, p1))
            line1.slice(1, line1.length)
                .forEach(position => {
                    display.draw(position.x, position.y, ".", color)
                })
            line2.slice(0, line2.length - 1)
                .forEach(position => {
                    display.draw(position.x, position.y, ".", color)
                })
        } else {
            const line = toArray(render(p0, p1))
            line.slice(1, line.length - 1)
                .forEach(position => {
                    display.draw(position.x, position.y, ".", color)
                })
        }

    }
}
