export class NumberHelper {
  static randomFixedNumber(mulBy = 10, fractionDigits = 3): number {
    return +(Math.random() * mulBy).toFixed(fractionDigits);
  }

  static countDecimals(number: number): number {
    if (Math.floor(number) === number) return 0;
    return number.toString().split(".")[1].length || 0;
  }

  // Polyfill for "%" operator (JS doesn`t work correctly with small numbers).
  static isDivisor(divided: number, divisor: number): boolean {
    const dividedDecimals = NumberHelper.countDecimals(divided);
    const divisorDecimals = NumberHelper.countDecimals(divisor);
    const decimals = dividedDecimals > divisorDecimals ? dividedDecimals : divisorDecimals;

    return (divided * Math.pow(10, decimals)) % (divisor * Math.pow(10, decimals)) === 0;
  }
}
