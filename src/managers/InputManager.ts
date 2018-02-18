import { World } from "mogwai-ecs/lib"

import { Manager } from "./Manager"

export interface InputState {
    isPressed: Map<number, boolean>,
    pressed: Set<number>,
    released: Set<number>,
    modifiers: Modifiers,
    mouse: Mouse,
}

export interface Modifiers {
    ctrl: boolean,
    alt: boolean
}

export interface Mouse {
    x: number,
    y: number,
    click_count: number,
    left: boolean,
    right: boolean
}

export class InputManager extends Manager<InputState> {
    public static NAME: string = "input_mgr"

    constructor() {
        super(InputManager.NAME)
    }

    public initialState(): InputState {
        return {
            isPressed: new Map(),
            pressed: new Set(),
            released: new Set(),
            mouse: {
                click_count: 0,
                x: 0,
                y: 0,
                left: false,
                right: false
            },
            modifiers: {
                alt: false,
                ctrl: false
            }
        }
    }

    public pressed(world: World, vkCode: number): boolean {
        return this.state(world).pressed.has(vkCode)
    }

    public register(world: World, handler: GlobalEventHandlers = document): void {
        super.register(world)

        handler.addEventListener("keydown", this.keydown.bind(this, world))
        handler.addEventListener("keyup", this.keyup.bind(this, world))
        handler.addEventListener("mousemove", this.mousemove.bind(this, world))
        handler.addEventListener("mousedown", this.mousedown.bind(this, world))
        handler.addEventListener("mouseup", this.mouseup.bind(this, world))
    }

    public execute(world: World): void {
        this.update(world, (state) => {
            state.pressed = new Set()
            state.released = new Set()
        })
    }

    public handleModifiers(modifiers: Modifiers, { altKey, ctrlKey }: KeyboardEvent | MouseEvent): void {
        modifiers.alt = altKey
        modifiers.ctrl = ctrlKey
    }

    public handleMouse(mouse: Mouse, { pageX, pageY, button, buttons, detail }: MouseEvent): void {
        mouse.x = pageX
        mouse.y = pageY

        if (button & 1) {
            mouse.left = true
        }
        if (buttons & 1) {
            mouse.left = false
        }

        if (button & 2) {
            mouse.right = true
        }
        if (buttons & 2) {
            mouse.right = false
        }

        mouse.click_count = detail || 0
    }

    public keydown(world: World, event: KeyboardEvent): void {
        this.update(world, (state) => {
            this.handleModifiers(state.modifiers, event)
            state.isPressed.set(event.keyCode, true)
            state.pressed.add(event.keyCode)
        })
    }

    public keyup(world: World, event: KeyboardEvent): void {
        this.update(world, (state) => {
            this.handleModifiers(state.modifiers, event)
            state.isPressed.set(event.keyCode, false)
            state.released.add(event.keyCode)
        })
    }

    public mousedown(world: World, event: MouseEvent): void {
        this.update(world, (state) => {
            this.handleModifiers(state.modifiers, event)
            this.handleMouse(state.mouse, event)
        })
    }

    public mouseup(world: World, event: MouseEvent): void {
        this.update(world, (state) => {
            this.handleModifiers(state.modifiers, event)
            this.handleMouse(state.mouse, event)
        })
    }

    public mousemove(world: World, event: MouseEvent): void {
        this.update(world, (state) => {
            this.handleModifiers(state.modifiers, event)
            this.handleMouse(state.mouse, event)
        })
    }
}
