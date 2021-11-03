const { getRepoApi, getRepoBranchApi, getRepoTagsApi } = require('../request/index')
const { wrapLoading } = require('../tools/util')
const { inquirer } = require('../tools/module')
const exec = require('child_process').exec
const { gitOwner } = require('../../package.json')

// downloadGitRepo 为普通方法，不支持promise，参考[https://www.npmjs.com/package/download-git-repo]
const downloadGitRepo = require('download-git-repo')
const util = require('util')
const path = require('path')
const log = require("./Log")
const loading = require("./Loading")

class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName // 项目文件名称
    this.target = targetDir // 项目文件目录
    this.branchs = []       // 项目分支列表，接口获取

    // 将downloadGitRepo 转化成promise的函数
    this.downloadGitRepo = util.promisify(downloadGitRepo)
  }

  async create() {
    // 先获取当前的模版信息
    let repo = await this.getRepoInfo()
    const { name: repoName } = repo

    // 根据模版获取当前的分支信息
    let branch = await this.getRepoBranch(repoName)

    // // 根据模版获取当前的版本信息
    // let tag = await this.getRepoTags(repoName)

    // 根据选择的模版和版本下载当前的地址内容
    let downloadUrl = await this.downloadGit(repoName, branch)

    // 下载完成后进入到当前的下载url中进行安装node_modules以及安装完成后进行提示
    let result = this.downloadNodeModules(downloadUrl)
  }

  // 获取用户某个仓库
  async getRepoInfo() {
    let repos = await wrapLoading(getRepoApi, 'Waiting for download the repository')
    return repos || {}
  }

  // 获取某个仓库的分支
  async getRepoBranch(repo) {
    let branchs = await wrapLoading(getRepoBranchApi, `Waiting for fetch the branch of template ${repo}`, repo)
    if (branchs.length == 0) {
      log.error("No content is currently downloaded")
    }

    // 保存分支列表
    this.branchs = branchs
    // 获取branchs的name
    branchs = branchs.map(item => item.name)

    // 用户交互展示出来
    let { branch } = await inquirer.prompt({
      name: 'branch',
      type: 'list',
      choices: branchs,
      message: "please choose a template to create project"
    })
    return branch
  }

  // 获取版本
  async getRepoTags(repo) {
    let tags = await wrapLoading(getRepoTagsApi, `Waiting for fetch the tags of template ${repo}`, repo)
    if (tags.length == 0) {
      log.error("No content is currently downloaded")
    }

    // 获取tags的name
    tags = tags.map(tag => tag.name)

    // 用户交互展示出来
    let { tag } = await inquirer.prompt({
      name: 'tag',
      type: 'list',
      choices: tags,
      message: "please choose this template of tags"
    })
    return tag
  }

  // 进行下载
  async downloadGit(repo, branch) {
    let downloadUrl = path.resolve(process.cwd(), this.target)

    // 1.先拼接出下载路径，格式：github:owner/name 或者 owner/name
    let requestUrl = `${gitOwner}/${repo}${branch ? '#' + branch : ''}`

    // 2.把路径资源下载到某个路径上

    // todo 后续可以增加缓存功能 
    await wrapLoading(this.downloadGitRepo, `Waiting for download the template of ${repo}${branch ? '/' + branch : ''}`, requestUrl, downloadUrl)
    return downloadUrl
  }

  // 安装依赖
  async downloadNodeModules(downLoadUrl) {
    let that = this
    log.success('\n √ Generation completed!')

    // 进行项目目录下，安装依赖
    const execProcess = `cd ${downLoadUrl} && npm install`

    loading.show("Downloading node_modules")
    exec(execProcess, function (error, stdout, stderr) {
      if (error) {
        loading.fail(error)
        log.warning(`\rplease enter file《 ${that.name} 》 to install dependencies`)
        log.success(`\n cd ${that.name} \n npm install \n`)
        process.exit()
      } else {
        log.success(`\n cd ${that.name} \n npm run server \n`)
      }
      process.exit()
    })
    return true
  }
}

module.exports = Creator