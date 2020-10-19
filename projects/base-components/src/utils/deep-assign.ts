export function deepAssign(target, source) {

  // tslint:disable-next-line: forin
  for (const prop in source) {
    if (target[prop] == null) {
      target[prop] = source[prop];
      continue;
    }

    switch (typeof source[prop]) {
      case 'number':
      case 'string':
      case 'boolean':
        target[prop] = source[prop];
        break;
      case 'object':
        deepAssign(target[prop], source[prop]);
        break;
      default:
        throw new Error(`Unsupported type ${typeof source}`);
    }
  }

  return target;
}
