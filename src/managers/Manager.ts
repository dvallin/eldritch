import { VectorStorage, World } from "mogwai-ecs/lib"

export abstract class Manager<State> {
    public stateId: number | undefined
    public name: string

    constructor(name: string) {
        this.name = name
    }

    public abstract initialState(): State

    public register(world: World): void {
        world.registerComponent(this.name, new VectorStorage())
        this.stateId = world.entity(undefined).with(this.name, this.initialState()).close()
    }

    public state(world: World): State {
        if (this.stateId !== undefined) {
            const states = world.fetch(this.stateId)
                .withComponents(this.name)
                .collect()
            return states[0][this.name]
        }
        return this.initialState()
    }

    public update(world: World, updater: (s: State) => void): void {
        if (this.stateId !== undefined) {
            world.entity(this.stateId)
                .update(this.name, updater)
                .close()
        }
    }
}
