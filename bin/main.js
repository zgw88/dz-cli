#! /usr/bin/env node

const program = require('commander')
const create = require('../lib/create')
const chalk = require('chalk')
const figlet = require('figlet')

program
    .command('create <app-name>')
    .description('create a new project')
    .option('--f, --force', 'overwrite target directory if it exist')
    .action((name, options) => {
        // 打印执行结果
        // console.log('name:',name,'options:',options)
        create(name,options)
    })

program
    .version(`v${require('../package.json').version}`)
    .usage('<command> [option]')


program
  .command('config [value]')
  .description('inspect and modify the config')
  .option('-g, --get <path>', 'get value from option')
  .option('-s, --set <path> <value>')
  .option('-d, --delete <path>', 'delete option from config')
  .action((value, options) => {
    console.log(value, options)
  })

// 配置 ui 命令
program
  .command('ui')
  .description('start add open roc-cli ui')
  .option('-p, --port <port>', 'Port used for the UI Server')
  .action((option) => {
    console.log(option)
  })

program
  .on('--help', () => {
    // 使用 figlet 绘制 Logo
    console.log('\r\n' + figlet.textSync('DZ-CLI', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    }));
    // 新增说明信息
    console.log(`\r\nRun ${chalk.cyan(`roc <command> --help`)} show details\r\n`)
  })

// 解析用户执行命令传入参数
program.parse(process.argv);
