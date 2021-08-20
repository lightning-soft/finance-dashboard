export class ArrayHelper {
  static swapItems(arr: any[], j: number, i: number) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}
