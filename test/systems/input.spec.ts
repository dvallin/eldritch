import ROT from "rot-js"

import { Input } from "@/systems/Input"
import { World } from "mogwai-ecs/lib"

describe("input", () => {
    let input: Input
    let world: World
    beforeEach(() => {
        world = new World()
        input = new Input()
        input.build(world)
        input.register(world)
    })

    it("registers itself", () => {
        expect(world.systems.get(Input.NAME)).toBe(input)
    })

    describe("keydown handling", () => {
        it("handles characters", () => {
            document.dispatchEvent(Object.assign(new Event("keydown"), { keyCode: ROT.VK_A }))
            expect(input.isPressed(ROT.VK_A)).toBeTruthy()
        })

        it("handles modifiers", () => {
            document.dispatchEvent(Object.assign(new Event("keydown"), { ctrlKey: true, altKey: true }))
            expect(input.isPressed(ROT.VK_CONTROL)).toBeTruthy()
            expect(input.isPressed(ROT.VK_ALT)).toBeTruthy()
        })
    })

    describe("keyup handling", () => {
        it("handles characters", () => {
            document.dispatchEvent(Object.assign(new Event("keydown"), { keyCode: ROT.VK_A }))
            document.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: ROT.VK_A }))
            expect(input.isPressed(ROT.VK_A)).toBeFalsy()
        })

        it("handles modifiers", () => {
            document.dispatchEvent(Object.assign(new Event("keydown"), { ctrlKey: true, altKey: true }))
            document.dispatchEvent(Object.assign(new Event("keydown"), { ctrlKey: false, altKey: false }))
            expect(input.isPressed(ROT.VK_CONTROL)).toBeFalsy()
            expect(input.isPressed(ROT.VK_ALT)).toBeFalsy()
        })
    })

    const mouseButtonTests: [number, boolean, boolean][] = [
        [0, false, false],
        [1, true, false],
        [2, false, true],
        [3, true, true],
        [4, false, false],
        [5, true, false],
        [6, false, true],
        [7, true, true],
        [8, false, false]
    ]

    describe("mousedown handling", () => {
        mouseButtonTests.forEach(([buttons, left, right]) => {
            it(`should set lr-button state to (${left}, ${right}) on buttons ${buttons}`, () => {
                document.dispatchEvent(new MouseEvent("mousedown", {
                    buttons, clientX: 0, clientY: 0,
                }))
                expect(input.mouse).toEqual({ click_count: 0, left, right, x: 0, y: 0 })
            })
        })
    })

    describe("mouseup handling", () => {
        mouseButtonTests.forEach(([buttons, left, right]) => {
            it(`should set lr-button state to (${!left}, ${!right}) on buttons ${buttons}`, () => {
                document.dispatchEvent(new MouseEvent("mousedown", {
                    buttons: 3, clientX: 0, clientY: 0,
                }))
                document.dispatchEvent(new MouseEvent("mouseup", {
                    buttons, clientX: 0, clientY: 0,
                }))
                expect(input.mouse).toEqual({ click_count: 0, left: !left, right: !right, x: 0, y: 0 })
            })
        })
    })

    describe("mousemove handling", () => {
        it("should handle mouse move position changes", () => {
            document.dispatchEvent(new MouseEvent("mousemove", {
                clientX: 42, clientY: 42,
            }))
            expect(input.mouse).toEqual({ click_count: 0, left: false, right: false, x: 42, y: 42 })
        })
    })

    describe("released and pressed state", () => {
        it("capture pressed", () => {
            document.dispatchEvent(Object.assign(new Event("keydown"), { keyCode: ROT.VK_A }))
            expect(input.pressed(ROT.VK_A)).toBeTruthy()
        })

        it("should capture released and pressed", () => {
            document.dispatchEvent(Object.assign(new Event("keydown"), { keyCode: ROT.VK_A }))
            document.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: ROT.VK_A }))
            expect(input.pressed(ROT.VK_A)).toBeTruthy()
            expect(input.released(ROT.VK_A)).toBeTruthy()
        })

        it("should reset released and pressed on draw", () => {
            document.dispatchEvent(Object.assign(new Event("keydown"), { keyCode: ROT.VK_A }))
            document.dispatchEvent(Object.assign(new Event("keyup"), { keyCode: ROT.VK_A }))
            input.draw(world)
            expect(input.pressed(ROT.VK_A)).toBeFalsy()
            expect(input.released(ROT.VK_A)).toBeFalsy()
        })
    })
})
