import { System, World } from "mogwai-ecs/lib"
import { Display } from "rot-js"

export interface GameSystem extends System {
    register: (world: World) => void
    build: (world: World) => void
    draw: (world: World, display: Display) => void
}
