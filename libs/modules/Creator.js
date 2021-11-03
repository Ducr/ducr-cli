const { getRepoApi, getRepoBranchApi, getRepoTagsApi } = require('../request/index')
const { wrapLoading } = require('../tools/util')
const { inquirer } = require('../tools/module')
const exec = require('child_process').exec

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

  async create(option = {}) {
    // 获取命令行传入的owner、repository
    const { configOwner, configRepository } = option
    // 先获取当前的模版信息
    let repo = await this.getRepoInfo(configOwner, configRepository)
    const { name: repoName, owner = {} } = repo
    const { login: ownerName } = owner

    // 根据模版获取当前的分支信息
    let branch = await this.getRepoBranch(ownerName, repoName)

    // 根据模版获取当前的版本信息
    let tag = await this.getRepoTags(ownerName, repoName, branch)

    // 根据选择的模版和版本下载当前的地址内容
    let downloadUrl = await this.downloadGit(configOwner, repoName, branch, tag)

    // 下载完成后进入到当前的下载url中进行安装node_modules以及安装完成后进行提示
    let result = this.downloadNodeModules(downloadUrl)
  }

  // 获取用户某个仓库
  async getRepoInfo(owner, repo) {
    let repos = await wrapLoading(() => getRepoApi(owner, repo), 'Waiting for download the repository')
    return repos || {}
  }

  // 获取某个仓库的分支
  async getRepoBranch(owner, repo) {
    let branchs = await wrapLoading(() => getRepoBranchApi(owner, repo), `Waiting for fetch the branch of template ${repo}`, repo)
    if (branchs.length == 0) {
      log.error("No branch is currently downloaded")
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
  async getRepoTags(owner, repo, branch) {
    let tags = await wrapLoading(() => getRepoTagsApi(owner, repo), `Waiting for fetch the tags of template ${repo}`, repo)
    // 获取tags的name，筛选出归属于某个分支的下的tag，tag名称格式为：分支名+版本号
    tags = tags.map(tag => tag.name).filter(tag => tag.startsWith(branch))

    if (tags.length == 0) {
      log.error("No tag is currently downloaded")
      return
    }

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
  async downloadGit(owner, repo, branch, tag) {
    let downloadUrl = path.resolve(process.cwd(), this.target)

    // 1.先拼接出下载路径，默认是下载分支，格式：github:owner/name 或者 owner/name
    // 默认master分支, 后面添加"#branch"或"#tag"来指定branch或tag
    let requestUrl = `${owner}/${repo}${branch ? '#' + branch : ''}`
    let label = `${branch ? '/' + branch : ''}`

    // 如果有tag存在，则下载tag
    if (tag) {
      requestUrl = `${owner}/${repo}${tag ? '#' + tag : ''}`
      label = `${tag ? '/' + tag : ''}`
    }

    // todo 后续可以增加缓存功能 
    // 2.把路径资源下载到某个路径上
    await wrapLoading(this.downloadGitRepo, `Waiting for download the template of ${repo}${label}`, requestUrl, downloadUrl)
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