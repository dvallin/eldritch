import { VertexTraverser, World } from "mogwai-ecs/lib"
import { Display } from "rot-js"

import { GameSystem, RenderLayer } from "@/systems/GameSystem"
import { Locations } from "@/systems/Locations"

import { Description } from "@/components/Description"
import { Position } from "@/components/Position"

import { RelationBuilder } from "mogwai-ecs/lib/RelationBuilder"

export class Investigators implements GameSystem {

    public static NAME: string = "investigators"

    public renderLayer: RenderLayer = RenderLayer.Layer3

    public register(world: World): void {
        world.registerSystem(Investigators.NAME, this)
        world.registerComponent("investigator")
        world.registerRelation("isAt")
    }

    public build(world: World): void {
        const locations = world.systems.get(Locations.NAME) as Locations
        locations.build(world)

        const investigator = (at: string): void => {
            world.entity()
                .with("investigator")
                .with("description", new Description("Dr. A"))
                .rel((b: RelationBuilder) => b
                    .with("isAt")
                    .to(locations.location(at))
                    .close()
                ).close()
        }

        investigator("Arkham")
    }

    public execute({ }: World): void {
        //
    }

    public render(world: World, display: Display): void {
        world.fetch()
            .on((t: VertexTraverser) => t.hasLabel("investigator").out("isAt"))
            .withComponents("position")
            .stream()
            .each((value: {
                entity: number, position: Position
            }) => {
                const displayPosition = { x: value.position.x * 3, y: value.position.y * 2 }
                this.renderInvestigator(display, displayPosition)
            })
    }

    private renderInvestigator(display: Display, pos: Position): void {
        display.draw(pos.x, pos.y, "I", "yellow")
    }
}
