import { Fetcher, MapStorage, World } from "mogwai-ecs/lib"
import { Display, VK_ENTER } from "rot-js"


import { GameSystem, RenderLayer } from "@/systems/GameSystem"

import { Turn } from "@/components/Turn"

import { Input } from "@/systems/Input"
import { Investigators } from "@/systems/Investigators"

export class Turns implements GameSystem {
    public static NAME: string = "turns"

    public renderLayer: RenderLayer = RenderLayer.None

    private built: boolean = false

    public register(world: World): void {
        world.registerSystem(Turns.NAME, this)
        world.registerComponent("inTurn", new MapStorage<Turn>())
        world.registerComponent("waitTurn")
        world.registerComponent("tookTurn")
    }

    public build(world: World): void {
        if (!this.built) {
            const investigators = world.systems.get(Investigators.NAME) as Investigators
            investigators.build(world)

            world.fetch().on(t => t.hasLabel("investigator")).stream().each(value => {
                world.entity(value.entity).with("waitTurn").close()
            })

            this.built = true
        }
    }


    public execute(world: World): void {
        const input = world.systems.get(Input.NAME) as Input
        let skipTurn = false
        if (input) {
            skipTurn = input.isPressed(VK_ENTER)
        }

        const investigators = world.systems.get(Investigators.NAME) as Investigators

        const inTurn = this.fetchInTurnOrPutLeaderInTurn(world)
        let tookTurn
        if (skipTurn) {
            world.entity(inTurn)
                .withOut("inTurn")
                .with("tookTurn")
                .close()
            tookTurn = inTurn
        }

        if (tookTurn !== undefined) {
            const waiting = this.waiting(world).collect()
            if (waiting.length > 0) {
                const selected = this.selectFromWaitingList(waiting, tookTurn)
                world.entity(selected)
                    .withOut("waitTurn")
                    .with("inTurn")
                    .close()
                if (investigators) {
                    investigators.activate(world, selected)
                }
            } else {
                this.tookTurn(world).stream().each(value =>
                    world.entity(value.entity)
                        .withOut("tookTurn")
                        .with("waitTurn")
                        .close()
                )
            }
        }
    }

    public render({ }: World, { }: Display): void {
        //
    }

    private selectFromWaitingList(waiting: { entity: number }[], afterId: number): number {
        const after = waiting.filter(v => v.entity > afterId)
        if (after.length === 0) {
            return waiting[0].entity
        }
        return after[0].entity
    }

    private fetchInTurnOrPutLeaderInTurn(world: World): number {
        let inTurn = this.inTurn(world).first()
        if (inTurn === undefined) {
            inTurn = this.leader(world).first()
            world.entity(inTurn.entity)
                .withOut("waitTurn")
                .with("inTurn", new Turn())
                .close()
        }
        return inTurn.entity
    }

    private leader(world: World): Fetcher {
        return world.fetch().on(t => t.hasLabel("leader"))
    }

    private inTurn(world: World): Fetcher {
        return world.fetch().on(t => t.hasLabel("inTurn"))
    }

    private waiting(world: World): Fetcher {
        return world.fetch().on(t => t.hasLabel("waitTurn"))
    }

    private tookTurn(world: World): Fetcher {
        return world.fetch().on(t => t.hasLabel("tookTurn"))
    }
}
