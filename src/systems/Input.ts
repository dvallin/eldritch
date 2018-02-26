import { World } from "mogwai-ecs/lib"
import ROT from "rot-js"

import { GameSystem, RenderLayer } from "./GameSystem"

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

    public renderLayer: RenderLayer = RenderLayer.None

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

    public render(): void {
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

    public released(vkCode: number): boolean {
        return this.state.released.has(vkCode)
    }

    get mouse(): Mouse {
        return this.state.mouse
    }

    public isPressed(vkCode: number): boolean {
        switch (vkCode) {
            case ROT.VK_ALT:
                return this.state.modifiers.alt
            case ROT.VK_CONTROL:
                return this.state.modifiers.alt
            default:
                return this.state.isPressed.get(vkCode) || false
        }
    }

    private handleModifiers(modifiers: Modifiers, { altKey, ctrlKey }: KeyboardEvent | MouseEvent): void {
        modifiers.alt = altKey
        modifiers.ctrl = ctrlKey
    }


    private handleMouse(mouse: Mouse, { clientX, clientY, buttons, detail }: MouseEvent, invert: boolean): void {
        mouse.x = clientX
        mouse.y = clientY
        mouse.left = (buttons & 1) === 1
        mouse.right = (buttons & 2) === 2
        if (invert) {
            mouse.left = !mouse.left
            mouse.right = !mouse.right
        }
        mouse.click_count = detail || 0
    }

    private keydown(event: KeyboardEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.state.isPressed.set(event.keyCode, true)
        this.state.pressed.add(event.keyCode)
    }

    private keyup(event: KeyboardEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.state.isPressed.set(event.keyCode, false)
        this.state.released.add(event.keyCode)
    }

    private mousedown(event: MouseEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.handleMouse(this.state.mouse, event, false)
    }

    private mouseup(event: MouseEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.handleMouse(this.state.mouse, event, true)
    }

    private mousemove(event: MouseEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.handleMouse(this.state.mouse, event, false)
    }
}
