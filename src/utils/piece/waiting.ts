export async function waitFor(second: number) {
    return new Promise((res) => setTimeout(() => res(true), second))
}