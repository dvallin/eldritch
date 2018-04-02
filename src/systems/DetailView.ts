import { VertexTraverser, World } from "mogwai-ecs/lib"
import { Display } from "rot-js"

import { GameSystem, RenderLayer } from "@/systems/GameSystem"
import { Input } from "@/systems/Input"
import { Investigators } from "@/systems/Investigators"
import { Locations } from "@/systems/Locations"

import { Description } from "@/components/Description"
import { Investigator } from "@/components/Investigator"

import { travelTraversal } from "@/traversals/travel"

interface EntityWithDescription {
  entity: number
  description: Description
}

interface State {
  type: string
}

class Idle implements State {
  public static isType(x: State): x is WaitForInput {
    return x.type === "Idle"
  }

  public type: string = "Idle"
}

class WaitForInput implements State {
  public static isType(x: State): x is WaitForInput {
    return x.type === "WaitForInput"
  }

  public type: string = "WaitForInput"

  constructor(public context: string) { }
}

class InputReceived implements State {
  public static isType(x: State): x is WaitForInput {
    return x.type === "InputReceived"
  }

  public type: string = "InputReceived"

  constructor(public context: string, public input: number) { }
}

interface InvestigatorWithData {
  entity: number
  description: Description
  investigator: Investigator
  connectionTypes: { relation: number, other: number, connection: { type: string } }[]
  location: { entity: number, location: { type: string } }[]
  connections: EntityWithDescription[]
}

export class DetailView implements GameSystem {
  public static NAME: string = "detail_view"

  public renderLayer: RenderLayer = RenderLayer.Layer4

  private state: State = new Idle()

  private selectedEntities: number[] = []

  private hoverLine: number | undefined = undefined
  private clickLine: number | undefined = undefined

  public register(world: World): void {
    world.registerSystem(DetailView.NAME, this)
  }

  public select(world: World, entity: number | undefined): void {
    if (Idle.isType(this.state)) {
      if (entity === undefined) {
        this.selectedEntities = []
      } else {
        this.selectedEntities = [entity]
      }
    } else if (WaitForInput.isType(this.state)) {
      if (entity === undefined) {
        const locations: Locations = world.systems.get(Locations.NAME) as Locations
        locations.clearHightlights(world)
        this.state = new Idle()
      } else {
        const context = (this.state as WaitForInput).context
        this.state = new InputReceived(context, entity)
      }
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
    if (InputReceived.isType(this.state)) {
      const state: InputReceived = (this.state as InputReceived)
      switch (state.context) {
        case "Travel":
          this.doTravelAction(world, state.input)
          break
        default:
          throw new Error(`Context ${state.context} not supported by DetailView`)
      }
      this.state = new Idle()
    }
  }

  public render(world: World, display: Display): void {
    if (this.selectedEntities.length > 0) {
      this.renderSelectedEntities(world, display)
    } else {
      this.renderActiveInvestigator(world, display)
    }
  }

  private doTravelAction(world: World, location: number): void {
    const investigator = this.activeInvestigator(world)
    if (investigator.connections.find(c => c.entity === location)) {
      const investigators: Investigators = world.systems.get(Investigators.NAME) as Investigators
      investigators.travel(world, investigator.entity, investigator.location[0].entity, location)
    }

    const locations: Locations = world.systems.get(Locations.NAME) as Locations
    locations.clearHightlights(world)
  }

  private renderActiveInvestigator(world: World, display: Display): void {
    const investigator = this.activeInvestigator(world)
    this.renderHeader(display, investigator.description.description)
    const actions = ["Travel"]
    if (investigator.location[0].location.type === "city") {
      if (investigator.connectionTypes.find(c => c.connection.type === "train")) {
        actions.push("Buy train ticket")
      }
      if (investigator.connectionTypes.find(c => c.connection.type === "ship")) {
        actions.push("Buy ship ticket")
      }
    }

    this.renderList(display, "Actions", 1, actions,
      (line => {
        const action = actions[line]
        this.state = new WaitForInput(actions[line])
        if (action === "Travel") {
          const locations: Locations = world.systems.get(Locations.NAME) as Locations
          locations.hightlight(world, investigator.connections.map(c => c.entity))
        } else if (action === "Buy train ticket") {
          const investigators: Investigators = world.systems.get(Investigators.NAME) as Investigators
          investigators.buyTrainTicket(world, investigator.entity)
        } else if (action === "Buy ship ticket") {
          const investigators: Investigators = world.systems.get(Investigators.NAME) as Investigators
          investigators.buyShipTicket(world, investigator.entity)
        }
      })
    )
  }

  private activeInvestigator(world: World): InvestigatorWithData {
    const investigator: InvestigatorWithData = world.fetch()
      .on((t: VertexTraverser) => t.hasLabel("investigator").hasLabel("active"))
      .subFetch("location", t => t.out("isAt"), "location")
      .relationsFetch("connectionTypes", v => v.out("isAt").bothE("connection"), "connection")
      .withComponents("description", "investigator")
      .first()
    investigator.connections = world.fetch(investigator.entity)
      .on(t => travelTraversal(t.out("isAt"), investigator.investigator.trainTickets, investigator.investigator.shipTickets))
      .withComponents("description")
      .collect()
    return investigator
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
        offsetY += this.renderEntitiesAsList(display, "Investigators", offsetY, value.investigators, callback)
        this.renderEntitiesAsList(display, "Connections", offsetY, value.connections, callback)
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

  private renderEntitiesAsList(
    display: Display, header: string, offsetY: number, entities: EntityWithDescription[],
    clickCallback: (e: number) => void,
  ): number {
    return this.renderList(display, header, offsetY,
      entities.map(v => v.description.description),
      (line: number) => clickCallback(entities[line].entity)
    )
  }

  private renderList(
    display: Display, header: string, offsetY: number,
    lines: string[], clickCallback: (line: number) => void,
  ): number {
    display.drawText(0, offsetY, header, 70)
    lines.forEach((line, index) => {
      const y = index + offsetY + 1
      if (this.clickLine === y) {
        clickCallback(index)
        this.clickLine = undefined
      }
      const text = line
      const bg = this.hoverLine === y ? "grey" : "black"
      this.drawText(display, 1, y, text, 70, bg)
    })
    if (lines.length === 0) {
      this.drawText(display, 1, offsetY + 1, "----", 70)
    }
    return 1 + (lines.length || 1)
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
