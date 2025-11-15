export const sumBy = <T>(array: T[], iteratee: (item: T) => number) =>
  array.reduce((acc, item) => acc + iteratee(item), 0);

