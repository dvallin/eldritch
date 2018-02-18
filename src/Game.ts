import ROT, { Display } from "rot-js"

import { VectorStorage, World } from "mogwai-ecs/lib"

import { GameSystem } from "@/systems/GameSystem"

import { Description } from "@/components/Description"
import { Position } from "@/components/Position"

const DEFAULT_WIDTH = 100
const DEFAULT_HEIGHT = 50

export class Game {
    public display: Display
    public world: World

    private systems: GameSystem[]

    constructor() {
        const displayOptions: ROT.DisplayOptions = {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT
        }
        this.display = new ROT.Display(displayOptions)
        this.world = new World()

        this.world.registerComponent("position", new VectorStorage<Position>())
        this.world.registerComponent("description", new VectorStorage<Description>())

        this.systems = []
    }

    public addGameSystem(system: GameSystem): void {
        system.register(this.world)
        this.systems.push(system)
    }

    public build(): void {
        document.body.appendChild(this.display.getContainer())
        this.systems.forEach((system: GameSystem) => system.build(this.world))
    }

    public run(): void {
        const next = Date.now() + 100
        this.tick()
        const untilNextFrame = next - Date.now()
        setTimeout(() => this.run(), untilNextFrame)
    }

    public tick(): void {
        this.world.run()
        this.display.clear()
        this.systems.forEach((system: GameSystem) => system.draw(this.world, this.display))
    }
}
