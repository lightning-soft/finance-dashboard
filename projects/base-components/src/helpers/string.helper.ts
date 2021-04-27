export class StringHelper {
  static capitalize(value: string): string {
    return value[0]?.toUpperCase() + value.slice(1);
  }

  static uncapitalize(value: string): string {
    return value[0]?.toLowerCase() + value.slice(1);
  }
}
