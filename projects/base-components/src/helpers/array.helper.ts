export class ArrayHelper {
  static swapItems(arr: any[], j: number, i: number) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  static shiftItems(arr: any[], previousIndex: number, currentIndex: number) {
    const element = arr[previousIndex];
    arr.splice(previousIndex, 1);
    arr.splice(currentIndex, 0, element);
  }
}
