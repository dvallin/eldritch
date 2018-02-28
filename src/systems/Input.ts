import { World } from "mogwai-ecs/lib"
import ROT from "rot-js"

import { GameSystem, RenderLayer } from "./GameSystem"

export interface InputState {
    isPressed: Map<number, boolean>
    pressed: Set<number>
    released: Set<number>
    mouse: Mouse
    mousePressed: [boolean, boolean]
    mouseReleased: [boolean, boolean]
    modifiers: Modifiers
}

export interface Modifiers {
    ctrl: boolean
    alt: boolean
}

export interface Mouse {
    x: number
    y: number
    click_count: number
    left: boolean
    right: boolean
}

export class Input implements GameSystem {
    public static NAME: string = "input_mgr"

    public renderLayer: RenderLayer = RenderLayer.None

    private state: InputState

    constructor(private eventToPosition: (e: UIEvent) => [number, number] | number) {
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
            mousePressed: [false, false],
            mouseReleased: [false, false],
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
        this.state.mousePressed = [false, false]
        this.state.mouseReleased = [false, false]
    }

    public execute({ }: World): void {
        // update is done in render
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

    public mousePressed(left: boolean = true): boolean {
        return this.state.mousePressed[left ? 0 : 1]
    }

    public mouseReleased(left: boolean = true): boolean {
        return this.state.mouseReleased[left ? 0 : 1]
    }

    get mouse(): Mouse {
        return this.state.mouse
    }

    public isPressed(vkCode: number): boolean {
        switch (vkCode) {
            case ROT.VK_ALT:
                return this.state.modifiers.alt
            case ROT.VK_CONTROL:
                return this.state.modifiers.ctrl
            default:
                return this.state.isPressed.get(vkCode) || false
        }
    }

    private handleModifiers(modifiers: Modifiers, { altKey, ctrlKey }: KeyboardEvent | MouseEvent): void {
        modifiers.alt = altKey
        modifiers.ctrl = ctrlKey
    }


    private handleMouse(mouse: Mouse, e: MouseEvent, invert: boolean): void {
        const pos = this.eventToPosition(e) as [number, number]
        mouse.x = pos[0]
        mouse.y = pos[1]
        mouse.left = (e.buttons & 1) === 1
        mouse.right = (e.buttons & 2) === 2
        if (invert) {
            mouse.left = !mouse.left
            mouse.right = !mouse.right
        }
        mouse.click_count = e.detail || 0
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
        this.state.mousePressed[0] = (event.buttons & 1) === 1
        this.state.mousePressed[1] = (event.buttons & 2) === 2
    }

    private mouseup(event: MouseEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.handleMouse(this.state.mouse, event, true)
        this.state.mouseReleased[0] = (event.buttons & 1) !== 1
        this.state.mouseReleased[1] = (event.buttons & 2) !== 2
    }

    private mousemove(event: MouseEvent): void {
        this.handleModifiers(this.state.modifiers, event)
        this.handleMouse(this.state.mouse, event, false)
    }
}
