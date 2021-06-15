export class MixinHelper {
  static mixinDecorator(
    constructor: any,
    extendableMethods: string[] = [],
  ): (constructor: any) => void {
    return (derivedCtor: any) => {
      Object.getOwnPropertyNames(constructor.prototype)
        .forEach(name => {
          if (name === 'constructor') {
            return;
          }

          const derivedCtorProp = derivedCtor.prototype[name];
          const constructorProp = constructor.prototype[name];

          if (
            extendableMethods.includes(name)
            && typeof derivedCtorProp === 'function'
            && typeof constructorProp === 'function'
          ) {
            derivedCtor.prototype[name] = function(...args: any[]) {
              if (derivedCtorProp) {
                derivedCtorProp.apply(this, args);
              }

              if (constructorProp) {
                constructorProp.apply(this, args);
              }
            }
          } else {
            derivedCtor.prototype[name] = constructorProp;
          }
        });
    };
  }
}
