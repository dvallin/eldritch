import ROT, { Display } from "rot-js"

class Game {
    private display: Display
    private map: { [key: string]: string }

    constructor() {
        this.display = new ROT.Display()
        this.map = {}
    }

    public init(): void {
        document.body.appendChild(this.display.getContainer())
        this.generateMap()
    }

    private generateMap(): void {
        const digger = new ROT.Map.Digger()
        const freeCells: string[] = []

        const digCallback = (x: number, y: number, value: number) => {
            if (value === 0) {
                const key = x + "," + y
                this.map[key] = "."
                freeCells.push(key)
            }
        }
        digger.create(digCallback.bind(this))

        this.generateBoxes(freeCells)
        this.drawWholeMap()
    }

    private generateBoxes(freeCells: string[]): void {
        for (let i = 0; i < 10; i++) {
            const index = Math.floor(ROT.RNG.getUniform() * freeCells.length)
            const key = freeCells.splice(index, 1)[0]
            this.map[key] = "*"
        }
    }

    private drawWholeMap(): void {
        for (const key in this.map) {
            if (this.map.hasOwnProperty(key)) {
                const parts = key.split(",")
                const x = parseInt(parts[0], 10)
                const y = parseInt(parts[1], 10)
                this.display.draw(x, y, this.map[key])
            }
        }
    }
}

const game = new Game()
game.init()
