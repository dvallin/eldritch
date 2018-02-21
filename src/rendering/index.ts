import { Position } from "@/components/Position"
import LazyJS from "lazy.js"

export type RenderIterator = () => Position | undefined

export function toStream(iter: RenderIterator): LazyJS.Sequence<Position> {
    return LazyJS.generate(iter)
        .takeWhile((p: Position | undefined) => p !== undefined)
        .map(p => p as Position)
}
