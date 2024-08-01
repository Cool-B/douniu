export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

export function uniqueObjectArray<T>(arr: T[], key: keyof T): T[] {
  const uniqueValues = new Set();
  const uniqueArr: T[] = [];
  for (const item of arr) {
    const keyValue = item[key];
    if (!uniqueValues.has(keyValue)) {
      uniqueValues.add(keyValue);
      uniqueArr.push(item);
    }
  }

  return uniqueArr;
}