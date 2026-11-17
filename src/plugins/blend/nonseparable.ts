type RGB = [number,number,number];
export type NonseparableMode = "hue" | "saturation" | "color" | "luminosity";
const lum = (c:RGB) => .3*c[0]+.59*c[1]+.11*c[2];
const sat = (c:RGB) => Math.max(...c)-Math.min(...c);

function setLum(c:RGB, light:number):RGB {
  const delta = light-lum(c);
  let result = c.map(v=>v+delta) as RGB;
  const min = Math.min(...result), max = Math.max(...result);
  if (min < 0) result = result.map(v=>light+(v-light)*light/(light-min)) as RGB;
  if (max > 1) result = result.map(v=>light+(v-light)*(1-light)/(max-light)) as RGB;
  return result.map(v=>Math.max(0,Math.min(1,v))) as RGB;
}

function setSat(c:RGB, saturation:number):RGB {
  const [low,mid,high] = [0,1,2].sort((a,b)=>c[a]-c[b] || a-b);
  const result:RGB = [0,0,0];
  if (c[high] > c[low]) {
    result[mid] = (c[mid]-c[low])*saturation/(c[high]-c[low]);
    result[high] = saturation;
  }
  return result;
}

/** W3C non-separable blending in normalized encoded sRGB (not HSL or WCAG luminance). */
export function nonseparable(base:RGB, source:RGB, mode:NonseparableMode):RGB {
  switch (mode) {
    case "hue": return setLum(setSat(source,sat(base)),lum(base));
    case "saturation": return setLum(setSat(base,sat(source)),lum(base));
    case "color": return setLum(source,lum(base));
    case "luminosity": return setLum(base,lum(source));
  }
}
