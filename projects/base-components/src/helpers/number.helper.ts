export class NumberHelper {
  static randomFixedNumber(mulBy = 10, fractionDigits = 3): number {
    return +(Math.random() * mulBy).toFixed(fractionDigits);
  }
}
