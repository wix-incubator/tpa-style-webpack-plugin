export const clonedWith =  <T>(original: T, override: Partial<T>): T => {
    const newStyleParams = JSON.parse(JSON.stringify(original));
    return Object.assign({}, original, override)
}
