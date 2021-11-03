// 项目所需要依赖的三方模块

// 命令行输出颜色提示
const chalk = require('chalk')

// 解析当前输入的命令
const commander = require('commander')

// 轻量级的命令行参数解析器，可将 --config Ducr 转换为键值对 config: Ducr
const minimist = require('minimist')

// 命令行输出选择框，checkbox、list 命令行交互
const inquirer = require('inquirer')

// 文件操作系统，比fs的功能更加全面
const fse = require('fs-extra')

// 页面等待loading操作
const ora = require('ora')

// 页面输入框输入参数，使用这个工具可以自动提供提示信息，并且分步接收用户的输入，体验类似npm init时的一步一步输入参数的过程
const prompt = require('co-prompt')

module.exports = {
  chalk,
  commander,
  minimist,
  inquirer,
  fse,
  ora,
  prompt,
}
