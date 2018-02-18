import { World } from "mogwai-ecs/lib"

import { GameSystem } from "./GameSystem"

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

export class Input implements GameSystem {
    public static NAME: string = "input_mgr"

    private state: InputState

    constructor() {
        this.state = {
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

    public build({ }: World): void {
        //
    }

    public draw({ }: World): void {
        this.state.pressed = new Set()
        this.state.released = new Set()
    }

    public execute({ }: World): void {
        // update is done in draw
    }

    public register(world: World): void {
        world.registerSystem(Input.NAME, this)
        document.addEventListener("keydown", this.keydown.bind(this))
        document.addEventListener("keyup", this.keyup.bind(this))
        document.addEventListener("mousemove", this.mousemove.bind(this))
        document.addEventListener("mousedown", this.mousedown.bind(this))
        document.addEventListener("mouseup", this.mouseup.bind(this))
    }

    public pressed(vkCode: number): boolean {
        return this.state.pressed.has(vkCode)
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

    public keydown(event: KeyboardEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.state.isPressed.set(event.keyCode, true)
        this.state.pressed.add(event.keyCode)
    }

    public keyup(event: KeyboardEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.state.isPressed.set(event.keyCode, false)
        this.state.released.add(event.keyCode)
    }

    public mousedown(event: MouseEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.handleMouse(this.state.mouse, event)
    }

    public mouseup(event: MouseEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.handleMouse(this.state.mouse, event)
    }

    public mousemove(event: MouseEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.handleMouse(this.state.mouse, event)
    }
}
