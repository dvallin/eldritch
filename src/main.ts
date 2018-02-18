import { Game } from "./Game"

import { WorldMap } from "@/systems/WorldMap"

import { InputManager } from "@/managers/InputManager"

const game = new Game()

game.addGameSystem(new WorldMap())
game.addManager(new InputManager())

game.build()
game.run()


