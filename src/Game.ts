import ROT, { Display } from "rot-js"

import { VectorStorage, World } from "mogwai-ecs/lib"

import { GameSystem } from "@/systems/GameSystem"

import { Description } from "@/components/Description"
import { Position } from "@/components/Position"

const DEFAULT_WIDTH = 100
const DEFAULT_HEIGHT = 50

export interface GameSettings {
    framerate?: number
}

export function defaultSettings(): GameSettings {
    return {
        framerate: 30
    }
}

export class Game {
    public display: Display
    public world: World

    private systems: GameSystem[]

    private settings: GameSettings

    constructor(settings?: GameSettings) {
        this.settings = Object.assign(defaultSettings(), settings)

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
        this.systems.forEach(system =>
            system.build(this.world)
        )
    }

    public run(): void {
        const next = Date.now() + (1000 / this.settings.framerate!)
        this.tick()
        const untilNextFrame = next - Date.now()
        setTimeout(() => this.run(), untilNextFrame)
    }

    public tick(): void {
        this.world.run()
        this.display.clear()

        const systemsByLayer: GameSystem[][] = []
        this.systems.forEach(system => {
            const layer = systemsByLayer[system.renderLayer] || []
            layer.push(system)
            systemsByLayer[system.renderLayer] = layer
        })
        systemsByLayer.forEach(layer => {
            layer.forEach(system =>
                system.render(this.world, this.display)
            )
        })
    }
}
