import { VectorStorage, VertexTraverser, World } from "mogwai-ecs/lib"
import { Display } from "rot-js"

import { GameSystem, RenderLayer } from "@/systems/GameSystem"
import { Locations } from "@/systems/Locations"

import { Description } from "@/components/Description"
import { Position } from "@/components/Position"

import { toArray } from "@/rendering"
import { render } from "@/rendering/lines"

export class Connections implements GameSystem {

    public static NAME: string = "connections"

    public renderLayer: RenderLayer = RenderLayer.Layer1

    public register(world: World): void {
        world.registerSystem(Connections.NAME, this)
        world.registerRelation("connection", new VectorStorage())
    }

    public build(world: World): void {
        const locations = world.systems.get(Locations.NAME) as Locations
        locations.build(world)

        const road = (from: string, to: string): void => {
            world.relation()
                .from(locations.location(from))
                .to(locations.location(to))
                .with("connection", { type: "road" })
                .close()
        }

        const train = (from: string, to: string): void => {
            world.relation()
                .from(locations.location(from))
                .to(locations.location(to))
                .with("connection", { type: "train" })
                .close()
        }

        const ship = (from: string, to: string): void => {
            world.relation()
                .from(locations.location(from))
                .to(locations.location(to))
                .with("connection", { type: "ship" })
                .close()
        }

        ship("San Francisco", "1")
        ship("San Francisco", "2")
        train("San Francisco", "5")
        road("4", "1")
        road("4", "5")
        train("5", "Arkham")
        ship("London", "Arkham")
        ship("London", "Rome")
        ship("Rome", "The Pyramids")
        train("Rome", "Istanbul")
        train("Istanbul", "The Pyramids")
        road("The Heart Of Africa", "The Pyramids")
        ship("Sydney", "Antarctica")
        ship("Tokyo", "Shanghai")
        road("Shanghai", "The Himalayas")
        ship("3", "Buenos Aires")
        road("3", "Sydney")
    }

    public execute({ }: World): void {
        //
    }

    public render(world: World, display: Display): void {
        world.fetch()
            .on((t: VertexTraverser) => t.hasLabel("location"))
            .withComponents("position")
            .relationsFetch("connections", (t: VertexTraverser) => t.outE("connection"), "connection")
            .subFetch("roads", (t: VertexTraverser) => t.out("connection"), "position")
            .stream()
            .each((value: {
                entity: number, position: Position, description: Description,
                roads: [{ entity: number, position: Position }]
                connections: [{ relation: number, other: number, "connection": { type: string } }]
            }) => {
                const displayPosition = { x: value.position.x * 3, y: value.position.y * 2 }
                value.roads.forEach((other, index) => {
                    const otherDisplayPosition = { x: other.position.x * 3, y: other.position.y * 2 }
                    const type = value.connections[index].connection.type
                    this.renderConnection(display, type, displayPosition, otherDisplayPosition)
                })
            })
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
