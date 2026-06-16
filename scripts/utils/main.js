export function wait(time) {
    return new Promise((r) => setTimeout(r, time))
}