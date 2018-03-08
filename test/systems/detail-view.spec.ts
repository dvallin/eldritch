import { Game } from "@/Game"

import { DetailView } from "@/systems/DetailView"

import { Connections } from "@/systems/Connections"
import { Input } from "@/systems/Input"
import { Investigators } from "@/systems/Investigators"
import { Locations } from "@/systems/Locations"

describe("Detail View", () => {

    let detailView: DetailView
    let game: Game
    let input: Input
    let locations: Locations
    let connections: Connections
    let investigators: Investigators
    let drawText: jest.SpyInstance<{}>
    beforeEach(() => {
        detailView = new DetailView()
        game = new Game()
        input = new Input(game.display.eventToPosition)
        investigators = new Investigators()
        connections = new Connections()
        locations = new Locations()
        drawText = jest.spyOn(game.display, "drawText")
        game.addGameSystem(detailView)
        game.addGameSystem(input)
        game.addGameSystem(connections)
        game.addGameSystem(locations)
        game.addGameSystem(investigators)
        game.build()
    })

    function expectDrawText(...text: (string | string[])[]): void {
        text.forEach((line: string | string[], index: number) => {
            if (typeof line === "string") {
                const firstNonWhitespace = line.search(/\S|$/)
                expect(drawText).toHaveBeenCalledWith(firstNonWhitespace, index, line.substring(firstNonWhitespace), 70)
            } else {
                let offset = 0
                line.forEach(word => {
                    expect(drawText).toHaveBeenCalledWith(offset, index, word, 70 - offset)
                    offset += word.length
                })
            }
        })
    }

    it("draws investigator info if nothing is selected", () => {
        detailView.render(game.world, game.display)
        expectDrawText(
            "Dr. A",
            "Travel Actions", " London", " 5"
        )
    })

    it("draws connections of selected locations", () => {
        detailView.select(locations.location("London"))
        detailView.render(game.world, game.display)
        expectDrawText(
            "London is a city",
            "Investigators", " ----",
            "Connections", " Arkham", " Rome"
        )
    })

    it("draws investigators of selected locations", () => {
        detailView.select(locations.location("Arkham"))
        detailView.render(game.world, game.display)
        expectDrawText(
            "Arkham is a city",
            "Investigators", " Dr. A",
            "Connections", " London", " 5"
        )
    })

    it("navigates connection when clicked", () => {
        // given
        detailView.select(locations.location("London"))
        input.mousePressed = jest.fn().mockReturnValue(true)
        input.mouse.y = 4
        detailView.execute(game.world)

        // when
        detailView.render(game.world, game.display)

        // then
        drawText.mockReset()
        detailView.render(game.world, game.display)
        expectDrawText(
            ["<- ", "Arkham is a city"]
        )
    })
})
