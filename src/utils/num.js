/**
 * 得到一个大于0小于传入值的随机整数
 * @param {*} max
 * @returns
 */
export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
/**
 * 得到一个两数之间的随机数
 * @param {Number} min
 * @param {Number} max
 * @returns
 */
export function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
/**
 * 得到一个两数之间的随机整数
 * @param {Number} min
 * @param {Number} max
 * @returns
 */
export function getRandomIntOfRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
}
