import { World } from "mogwai-ecs/lib"
import { Manager } from "./Manager"

export class StatelessManager extends Manager<undefined> {
    public initialState(): undefined {
        return undefined
    }

    public execute({ }: World): void {
        //
    }
}
