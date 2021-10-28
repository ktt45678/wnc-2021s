export function appendToFilename(filename: string, value: string) {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex == -1) return filename + value;
  else return filename.substring(0, dotIndex) + value + filename.substring(dotIndex);
}

export function escapeRegExp(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export function maskString(text: string) {
  let pos = text.lastIndexOf(' ');
  if (pos === -1 || pos > text.length)
    pos = Math.trunc(text.length / 2);
  const unmasked = text.substring(pos + 1);
  let masked = '*****';
  masked += unmasked;
  return masked;
}