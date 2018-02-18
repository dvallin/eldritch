import { System, VectorStorage, World } from "mogwai-ecs/lib"

export abstract class Manager<State> implements System {
    public stateId: number | undefined
    public systemName: string

    constructor(componentName: string) {
        this.systemName = componentName
    }

    public abstract execute(world: World): void

    public abstract initialState(): State

    public register(world: World): void {
        world.registerSystem(this.systemName, this)
        world.registerComponent(this.systemName, new VectorStorage())
        this.stateId = world.entity(undefined).with(this.systemName, this.initialState()).close()
    }

    public state(world: World): State {
        if (this.stateId !== undefined) {
            const state = world.fetch(this.stateId)
                .withComponents(this.systemName)
                .first()
            return state[this.systemName]
        }
        return this.initialState()
    }

    public update(world: World, updater: (s: State) => void): void {
        if (this.stateId !== undefined) {
            world.entity(this.stateId)
                .update(this.systemName, updater)
                .close()
        }
    }
}
