import { System, World } from "mogwai-ecs/lib"
import { Display } from "rot-js"

export enum RenderLayer {
    None,
    Background,
    Foreground,
}

export interface GameSystem extends System {
    renderLayer: RenderLayer
    register: (world: World) => void
    build: (world: World) => void
    render: (world: World, display: Display) => void
}
