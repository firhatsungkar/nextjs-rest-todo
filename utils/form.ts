export const resetInputElement = (
  element: HTMLInputElement | HTMLInputElement[],
  callback?: () => any
): void => {
  if (Array.isArray(element)) {
    element.forEach(
      (el) => { el.value = '' }
    )
  } else {
    element.value = '';
  }
  callback && callback()
}