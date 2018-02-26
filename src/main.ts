import { Game } from "./Game"

import { Connections } from "@/systems/Connections"
import { Input } from "@/systems/Input"
import { Investigators } from "@/systems/Investigators"
import { Locations } from "@/systems/Locations"

const game = new Game()

game.addGameSystem(new Connections())
game.addGameSystem(new Investigators())
game.addGameSystem(new Input())
game.addGameSystem(new Locations())

game.build()
game.run()


