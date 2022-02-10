export function hexToRgba(hex: string, opacity = 1): string {
  let r, g, b, placeholder;
  if (hex.startsWith('rgb')) {
    [placeholder,r,g,b] = hex.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3}),? ?(\d{0,3}.?\d{1,2}?)\)/).map(x => parseInt(x, 16))
  } else
    [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));

  return `rgba(${r},${g},${b},${opacity})`;
}
