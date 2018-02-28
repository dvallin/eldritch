import { Game } from "./Game"

import { Connections } from "@/systems/Connections"
import { DetailView } from "@/systems/DetailView"
import { Input } from "@/systems/Input"
import { Investigators } from "@/systems/Investigators"
import { Locations } from "@/systems/Locations"

const game = new Game()

game.addGameSystem(new Connections())
game.addGameSystem(new DetailView())
game.addGameSystem(new Investigators())
game.addGameSystem(new Input((e) => game.display.eventToPosition(e)))
game.addGameSystem(new Locations())

game.build()
game.run()


