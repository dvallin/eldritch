import { VectorStorage, Vertex, VertexTraverser, World } from "mogwai-ecs/lib"
import ROT, { Display } from "rot-js"

import { GameSystem, RenderLayer } from "@/systems/GameSystem"
import { Input } from "@/systems/Input"

import { Description } from "@/components/Description"
import { Position } from "@/components/Position"
import { DetailView } from "@/systems/DetailView"

export class Locations implements GameSystem {
  public static NAME: string = "locations"

  get renderLayer(): RenderLayer {
    return this.showFullNames ? RenderLayer.Layer4 : RenderLayer.Layer2
  }

  private locations: { [name: string]: number } = {}

  private showFullNames: boolean = false
  private built: boolean = false

  public register(world: World): void {
    world.registerSystem(Locations.NAME, this)
    world.registerComponent("location", new VectorStorage())
    world.registerComponent("highlight")
  }

  public location(name: string): Vertex | undefined {
    return this.locations[name]
  }

  public build(world: World): void {
    if (!this.built) {
      const city = (name: string, x: number, y: number): void => {
        this.locations[name] = world.entity()
          .with("location", { type: "city" })
          .with("position", new Position(x, y))
          .with("description", new Description(name))
          .close()
      }

      const sea = (name: string, x: number, y: number): void => {
        this.locations[name] = world.entity()
          .with("location", { type: "sea" })
          .with("position", new Position(x, y))
          .with("description", new Description(name))
          .close()
      }

      const site = (name: string, x: number, y: number): void => {
        this.locations[name] = world.entity()
          .with("location", { type: "site" })
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
      sea("Antarctica", 20, 22)

      city("1", 3, 6)
      sea("2", 2, 10)
      sea("3", 4, 18)
      city("4", 6, 6)
      city("5", 7, 8)
      city("6", 6, 9)
      city("7", 8, 11)
      city("8", 10, 10)
      city("13", 20, 4)
    }
    this.built = true
  }

  public execute(world: World): void {
    const inputMgr: Input = world.systems.get(Input.NAME) as Input
    if (inputMgr) {
      if (inputMgr.pressed(ROT.VK_M)) {
        this.showFullNames = !this.showFullNames
      }
      if (inputMgr.mousePressed()) {
        const mouseDisplayPosition = {
          x: inputMgr.mouse.x,
          y: inputMgr.mouse.y
        }
        if (this.isInsideMap(mouseDisplayPosition)) {
          this.pick(world, mouseDisplayPosition)
        }
      }
    }
  }

  public render(world: World, display: Display): void {
    interface LocationWithData {
      entity: number
      position: Position
      description: Description
      highlight: null | undefined
      location: { type: string }
    }
    world.fetch()
      .on((t: VertexTraverser) => t.hasLabel("location"))
      .withComponents("position", "description", "location", "highlight")
      .stream()
      .each((value: LocationWithData) => {
        const isHighlighted = value.highlight !== undefined
        const displayPosition = { x: value.position.x * 3, y: value.position.y * 2 }
        this.renderLocation(display, value.location.type,
          value.description.description, displayPosition,
          isHighlighted)
      })
  }

  public hightlight(world: World, highlights: number[]): void {
    highlights.forEach(v => {
      world.entity(v).with("highlight").close()
    })
  }

  public clearHightlights(world: World): void {
    world.fetch()
      .on(t => t.hasLabel("highlight"))
      .stream()
      .each(v => {
        world.entity(v.entity).withOut("highlight").close()
      })
  }

  private isInsideMap(position: Position): boolean {
    return position.y > 10
  }

  private pick(world: World, position: Position): void {
    interface EntityWithPosition {
      entity: number
      position: Position
    }
    const entity = world.fetch()
      .on((t: VertexTraverser) => t.hasLabel("location"))
      .withComponents("position")
      .stream()
      .filter((value: EntityWithPosition) => {
        const displayPosition = { x: value.position.x * 3, y: value.position.y * 2 }
        return displayPosition.x === position.x && displayPosition.y === position.y
      }).map((value: EntityWithPosition) => {
        return value.entity
      })
      .first()

    const detailView: DetailView = world.systems.get(DetailView.NAME) as DetailView
    if (detailView) {
      detailView.select(world, entity)
    }
  }

  private renderLocation(
    display: Display, type: string, description: string,
    pos: Position, isHighlighted: boolean
  ): void {
    let color: string
    if (isHighlighted) {
      color = "gold"
    } else if (type === "city") {
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
}
