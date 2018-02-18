import { Game } from "./Game"

import { Input } from "@/systems/Input"
import { WorldMap } from "@/systems/WorldMap"

const game = new Game()

game.addGameSystem(new WorldMap())
game.addGameSystem(new Input())

game.build()
game.run()


