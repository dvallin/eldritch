import { VertexTraverser, World } from "mogwai-ecs/lib"
import { Display } from "rot-js"

import { GameSystem, RenderLayer } from "@/systems/GameSystem"

import { Description } from "@/components/Description"

export class DetailView implements GameSystem {
    public static NAME: string = "detail_view"

    public renderLayer: RenderLayer = RenderLayer.Layer4

    private selectedEntity: number | undefined = undefined

    public register(world: World): void {
        world.registerSystem(DetailView.NAME, this)
    }

    public select(entity: number): void {
        this.selectedEntity = entity
    }

    public build({ }: World): void {
        //
    }

    public execute({ }: World): void {
        //
    }

    public render(world: World, display: Display): void {
        if (this.selectedEntity !== undefined) {
            interface LocationWithRelatedData {
                entity: number
                description: Description
                location: { type: string }
                investigators: [{ description: Description }]
                connections: [{ description: Description }]
            }
            world.fetch(this.selectedEntity)
                .on((t: VertexTraverser) => t.hasLabel("location"))
                .subFetch("investigators", (t: VertexTraverser) => t.in("isAt"), "description")
                .subFetch("connections", (t: VertexTraverser) => t.both("connection"), "description")
                .withComponents("description", "location")
                .stream()
                .each((value: LocationWithRelatedData) => {
                    this.renderLocation(display, value.location.type, value.description.description)
                    this.renderInvestigators(display, value.investigators)
                    this.renderConnections(display, value.connections)
                })
        }
    }

    private renderLocation(display: Display, type: string, description: string): void {
        display.drawText(0, 0, `${description} is a ${type}`, 70)
    }

    private renderInvestigators(display: Display, investigators: { description: Description }[]): void {
        if (investigators.length === 0) {
            display.drawText(0, 1, `there are no investigators`, 70)
        } else {
            const text = investigators.map(i => i.description.description).join(" and ")
            display.drawText(0, 1, `there is ${text}`, 70)
        }
    }

    private renderConnections(display: Display, connections: { description: Description }[]): void {
        const text = connections.map(i => i.description.description).join(" and ")
        display.drawText(0, 2, `there are connections to ${text}`, 70)
    }
}
