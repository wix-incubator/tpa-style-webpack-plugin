export const clonedWith = <T>(original: T, override: Partial<T>): T => {
  const newOriginal = JSON.parse(JSON.stringify(original));
  return {...newOriginal, ...override};
};
