export function requestAnimationFrame(): Promise<number> {
  return new Promise((resolve) => {
    window.requestAnimationFrame((time: number) =>
      resolve(time)
    )
  })
}
