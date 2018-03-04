import { Position } from "@/components/Position"
import LazyJS from "lazy.js"

export type RenderIterator = () => Position | undefined

export function toStream(iter: RenderIterator): LazyJS.Sequence<Position> {
  return LazyJS.generate(iter)
    .takeWhile((p: Position | undefined) => p !== undefined)
    .map(p => p as Position)
}

export function toArray(iter: RenderIterator): Position[] {
  const array = []
  while (true) {
    const p: Position | undefined = iter()
    if (p === undefined) {
      return array
    }
    array.push(p)
  }
}
