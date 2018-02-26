import { Game } from "./Game"

import { Connections } from "@/systems/Connections"
import { Input } from "@/systems/Input"
import { Locations } from "@/systems/Locations"

const game = new Game()

game.addGameSystem(new Connections())
game.addGameSystem(new Locations())
game.addGameSystem(new Input())

game.build()
game.run()


