import { MapStorage, Vertex, VertexTraverser, World } from "mogwai-ecs/lib"
import { Display } from "rot-js"

import { GameSystem, RenderLayer } from "@/systems/GameSystem"
import { Locations } from "@/systems/Locations"

import { Description } from "@/components/Description"
import { Investigator } from "@/components/Investigator"
import { Position } from "@/components/Position"

import { RelationBuilder } from "mogwai-ecs/lib/RelationBuilder"

export class Investigators implements GameSystem {

  public static NAME: string = "investigators"

  public renderLayer: RenderLayer = RenderLayer.Layer3

  private built: boolean = false

  private investigators: Map<string, Vertex> = new Map()

  public register(world: World): void {
    world.registerSystem(Investigators.NAME, this)
    world.registerComponent("investigator", new MapStorage<Investigator>())
    world.registerComponent("active")
    world.registerComponent("leader")
    world.registerRelation("isAt")
  }

  public build(world: World): void {
    if (!this.built) {
      const locations = world.systems.get(Locations.NAME) as Locations
      locations.build(world)

      const investigator = (name: string, at: string, instance: Investigator): number => {
        const i = world.entity()
          .with("investigator", instance)
          .with("description", new Description(name))
          .rel((b: RelationBuilder) => b
            .with("isAt")
            .to(locations.location(at)!)
            .close()
          ).close()
        this.investigators.set(name, i)
        return i
      }

      const firstInvestigator = investigator("Norman Whithers", "Arkham", new Investigator(5, 7, 3, 1, 3, 2, 4))
      investigator("Lola Hayes", "Tokyo", new Investigator(5, 7, 2, 4, 2, 2, 3))

      this.activate(world, firstInvestigator)
      this.setLeader(world, firstInvestigator)

      this.built = true
    }
  }

  public investigator(name: string): Vertex | undefined {
    return this.investigators.get(name)
  }

  public activate(world: World, entity: number): void {
    world.fetch().on((t: VertexTraverser) => t.hasLabel("active")).stream()
      .each(active => world.graph.removeVertexLabel(active.entity, "active"))
    world.entity(entity).with("active").close()
  }

  public setLeader(world: World, entity: number): void {
    world.fetch().on((t: VertexTraverser) => t.hasLabel("leader")).stream()
      .each(leader => world.graph.removeVertexLabel(leader.entity, "leader"))
    world.entity(entity).with("leader").close()
  }

  public buyShipTicket(world: World, entity: number): void {
    world.entity(entity).update("investigator", (i: Investigator) => i.shipTickets++).close()
  }

  public buyTrainTicket(world: World, entity: number): void {
    world.entity(entity).update("investigator", (i: Investigator) => i.trainTickets++).close()
  }

  public travel(world: World, entity: number, location: number): void {
    interface InvestigatorWithLocation { isAt: { relation: number }[] }
    world.fetch(entity)
      .relationsFetch("isAt", (t: VertexTraverser) => t.outE("isAt"))
      .stream().each((e: InvestigatorWithLocation) => {
        world.graph.removeEdge(e.isAt[0].relation)
      })
    world.relation()
      .from(entity)
      .to(location)
      .with("isAt")
      .close()
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
