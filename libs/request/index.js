// github的api文档：[https://api.github.com/]
// 获取github仓库主信息api：https://api.github.com/repos/Ducr/ducr-cli
// 获取github某仓库branch信息api：https://api.github.com/repos/Ducr/ducr-cli/branches
// 获取github某仓库tab信息api：https://api.github.com/repos/Ducr/ducr-cli/tags

const axios = require('axios')
const { gitOwner, repositoryName } = require('../../package.json')

// 添加拦截器
axios.interceptors.response.use(res => {
  return res.data
})

// 获取某个仓库主信息
async function getRepoApi(configOwner = gitOwner) {
  return axios.get(`https://api.github.com/repos/${configOwner}/${repositoryName}`)
}

// 获取某个仓库的branch
async function getRepoBranchApi(repo = repositoryName) {
  return axios.get(`https://api.github.com/repos/${gitOwner}/${repo}/branches`)
}

// 获取某个仓库的tag
async function getRepoTagsApi(repo = repositoryName) {
  return axios.get(`https://api.github.com/repos/${gitOwner}/${repo}/tags`)
}

module.exports = {
  getRepoApi,
  getRepoBranchApi,
  getRepoTagsApi
}