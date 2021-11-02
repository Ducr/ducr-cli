

const { ora } = require('./module')
const async = require("async")

// 延迟执行函数，默认间隔1000ms
function delayFn(delay = 1000) {
  var timer = null
  return new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      resolve()
      clearTimeout(timer)
    }, delay)
  })
}

// 页面的loading效果
async function wrapLoading() {
  let fn = arguments[0]
  let message = arguments[1]
  let args = toArray(arguments).slice(2) || []
  // 判断当前的参数是否标准
  if (!isFn(fn) || !isString(message)) {
    console.log("params error")
  }
  const spiner = ora(message)
  spiner.start() // 开启加载
  try {
    let repos = await fn(...args)
    spiner.succeed()
    return repos
  } catch (e) {
    spiner.fail("request failed , refetching...")
    await delayFn(1000)
    return wrapLoading(fn, message, ...args)
  }
}

function toArray(arr) {
  return Array.prototype.slice.call(arr)
}

function isFn(fn) {
  return Object.prototype.toString.call(fn) === "[object Function]"
}

function isArray(arr) {
  return Object.prototype.toString.call(arr) === "[object Array]"
}

function isObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]"
}

function isString(str) {
  return Object.prototype.toString.call(str) === "[object String]"
}

module.exports = {
  delayFn,
  wrapLoading,
  toArray,
  isString,
}