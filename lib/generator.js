const inquire = require('inquirer')
const {getRepoList, getTagList} = require('./http')
const ora = require('ora')
const util = require('util')
const path = require('path')
const downLoadGitRepo = require('download-git-repo')


//加载动画
async function wrapLoading(fn, message, ...args){
    // 用ora初始化 传入提示信息
    const spinner = ora(message)
    spinner.start()
    try{
        const result = await fn(...args)
        spinner.succeed()
        return result
    }catch(error){
        // 状态为修改为失败
        console.log(error,'err')
        spinner.fail('Request failed, refetch ...')
    }
}

class Generator {
    constructor(name,targetAir){
        this.name = name
        this.targetAir = targetAir
        //对download-git-repo 进行promise处理
        this.downLoadGitRepo = util.promisify(downLoadGitRepo)
    }

    // 获取用户选择的模板
    // 1）从远程拉取模板数据
    // 2）用户选择自己新下载的模板名称
    // 3）return 用户选择的名称

    async getRepo() {
        // 从远程拉取模版
        const repoList = await wrapLoading(getRepoList,'waiting fetch template')
        if(!repoList) return
        // 过滤需要的模版名称
        const repos = repoList.map(item => item.name)
        const {repo} = await inquire.prompt({
            name: 'repo',
            type: 'list',
            choices: repos,
            message: 'Please choose a template to create project'
        })
        // 3）return 用户选择的名称
        return repo;
    }

    // 获取用户选择的版本
    // 1）基于 repo 结果，远程拉取对应的 tag 列表
    // 2）用户选择自己需要下载的 tag
    // 3）return 用户选择的 tag
    async getTag(repo){
        const tags = await wrapLoading(getTagList,'waiting fetch tag',repo)
        if(!tags) return
        const tagsList = tags.map(item => item.name)
        // 2）用户选择自己需要下载的 tag
        const {tag } = inquire.prompt({
            name: 'tag',
            type: 'list',
            choices: tagsList,
            message: 'Place choose a tag to create project'
        })

        return tag
    }

    // 下载远程模板
    // 1）拼接下载地址
    // 2）调用下载方法
    async downLoad (repo,tag){
        // 1）拼接下载地址
        const requestUrl = `zhurong-cli/${repo}${tag?'#'+tag:''}`;

        // 2）调用下载方法
        await wrapLoading(
            this.downLoadGitRepo, // 远程下载方法
            'waiting download template', // 加载提示信息
            requestUrl, // 参数1: 下载地址
            path.resolve(process.cwd(), this.targetAir)) // 参数2: 创建位置
    }

    // 核心创建逻辑
    // 1）获取模板名称
    // 2）获取 tag 名称
    // 3）下载模板到模板目录
    async create(){
        // 1）获取模板名称
        const repo = await this.getRepo()
        // 2) 获取 tag 名称
        const tag = await this.getTag(repo)
        // 3）下载模板到模板目录
        await this.downLoad(repo, tag)
        console.log(`选择了，repo ${repo}`)
    }

}
module.exports = Generator