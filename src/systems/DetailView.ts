import { VertexTraverser, World } from "mogwai-ecs/lib"
import { Display } from "rot-js"

import { GameSystem, RenderLayer } from "@/systems/GameSystem"
import { Input } from "@/systems/Input"
import { Investigators } from "@/systems/Investigators"

import { Description } from "@/components/Description"


interface EntityWithDescription {
  entity: number
  description: Description
}

export class DetailView implements GameSystem {
  public static NAME: string = "detail_view"

  public renderLayer: RenderLayer = RenderLayer.Layer4

  private selectedEntities: number[] = []

  private hoverLine: number | undefined = undefined
  private clickLine: number | undefined = undefined

  public register(world: World): void {
    world.registerSystem(DetailView.NAME, this)
  }

  public select(entity: number | undefined): void {
    if (entity === undefined) {
      this.selectedEntities = []
    } else {
      this.selectedEntities = [entity]
    }
  }

  public build({ }: World): void {
    //
  }

  public execute(world: World): void {
    const inputMgr: Input = world.systems.get(Input.NAME) as Input
    if (inputMgr) {
      this.hoverLine = inputMgr.mouse.y
      if (inputMgr.mousePressed()) {
        this.clickLine = inputMgr.mouse.y
      }
    }
  }

  public render(world: World, display: Display): void {
    if (this.selectedEntities.length > 0) {
      this.renderSelectedEntities(world, display)
    } else {
      this.renderActiveInvestigator(world, display)
    }
  }

  private renderActiveInvestigator(world: World, display: Display): void {
    interface InvestigatorWithData {
      entity: number
      description: Description
      connections: EntityWithDescription[]
    }
    world.fetch()
      .on((t: VertexTraverser) => t.hasLabel("investigator").hasLabel("active"))
      .subFetch("connections", (t: VertexTraverser) => t.out("isAt").both("connection"), "description")
      .withComponents("description")
      .stream()
      .each((investigator: InvestigatorWithData) => {
        this.renderHeader(display, investigator.description.description)
        this.renderValues(display, "Travel Actions", investigator.connections, 1, (e: number) => {
          const investigators: Investigators = world.systems.get(Investigators.NAME) as Investigators
          investigators.travel(world, investigator.entity, e)
        })
      })
  }

  private renderSelectedEntities(world: World, display: Display): void {
    const selectedEntity = this.selectedEntities[this.selectedEntities.length - 1]
    interface LocationWithRelatedData {
      entity: number
      description: Description
      location: { type: string }
      investigators: EntityWithDescription[]
      connections: EntityWithDescription[]
    }
    world.fetch(selectedEntity)
      .on((t: VertexTraverser) => t.hasLabel("location"))
      .subFetch("investigators", (t: VertexTraverser) => t.in("isAt"), "description")
      .subFetch("connections", (t: VertexTraverser) => t.both("connection"), "description")
      .withComponents("description", "location")
      .stream()
      .each((value: LocationWithRelatedData) => {
        this.renderLocation(display, value.location.type, value.description.description)
        const callback = (entity: number) => this.selectedEntities.push(entity)
        let offsetY = 1
        offsetY += this.renderValues(display, "Investigators", value.investigators, offsetY, callback)
        this.renderValues(display, "Connections", value.connections, offsetY, callback)
      })
    world.fetch(selectedEntity)
      .on((t: VertexTraverser) => t.hasLabel("investigator"))
      .withComponents("description")
      .stream()
      .each((value: EntityWithDescription) => {
        this.renderInvestigator(display, value.description.description)
      })
  }

  private renderLocation(display: Display, type: string, description: string): void {
    this.renderHeader(display, `${description} is a ${type}`)
  }

  private renderInvestigator(display: Display, description: string): void {
    this.renderHeader(display, description)
  }

  private renderHeader(display: Display, text: string): void {
    if (this.selectedEntities.length <= 1) {
      display.drawText(0, 0, text, 70)
    } else {
      if (this.clickLine === 0) {
        this.selectedEntities.pop()
        this.clickLine = undefined
      }
      if (this.hoverLine === 0) {
        this.drawText(display, 0, 0, "<- ", 70, "grey")
      } else {
        this.drawText(display, 0, 0, "<- ", 70)
      }
      this.drawText(display, 3, 0, text, 67)
    }
  }

  private renderValues(
    display: Display, header: string, values: EntityWithDescription[], offsetY: number,
    clickCallback: (e: number) => void,
  ): number {
    display.drawText(0, offsetY, header, 70)
    values.forEach((value, index) => {
      const y = index + offsetY + 1
      if (this.clickLine === y) {
        clickCallback(value.entity)
        this.clickLine = undefined
      }
      const text = value.description.description
      const bg = this.hoverLine === y ? "grey" : "black"
      this.drawText(display, 1, y, text, 70, bg)
    })
    if (values.length === 0) {
      this.drawText(display, 1, offsetY + 1, "----", 70)
    }
    return 1 + (values.length || 1)
  }

  private drawText(display: Display, x: number, y: number, text: string, maxWidth: number,
    bg: string | undefined = display.getOptions().bg,
    fg: string | undefined = display.getOptions().fg
  ): void {
    const oldBg = display.getOptions().bg
    const oldFg = display.getOptions().fg
    display.setOptions({ fg, bg })
    display.drawText(x, y, text, maxWidth)
    display.setOptions({ bg: oldBg, fg: oldFg })
  }
}
