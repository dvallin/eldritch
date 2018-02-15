import { Manager } from "./Manager"

export class StatelessManager extends Manager<undefined> {
    public initialState(): undefined {
        return undefined
    }
}
