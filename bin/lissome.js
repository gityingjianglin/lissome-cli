#! /usr/bin/env node
// 入口文件
const { program } = require('commander');

// 获取package.json中version来作为项目的版本号
program.version(require('../package').version, '-v, --version');
program
  .command('init')
  .description('Generate a new project')
  .alias('i')
  .action(() => {
    require('../command/init.js')()
  })

program
  .command('add')
  .description('Add a new template')
  .alias('a')
  .action(() => {
    require('../command/add.js')()
  })

program
  .command('list')
  .description('Show template list')
  .alias('l')
  .action(() => {
    require('../command/list.js')()
  })

program
  .command('delete')
  .description('Delete a template')
  .alias('d')
  .action(() => {
    require('../command/delete.js')()
  })

program
  .command('docker')
  .description('download docker files')
  .alias('dk')
  .action(() => {
    require('../command/docker.js')()
  })

program
  .command('upgrade')
  .description('check lissome-cli version.')
  .alias('u')
  .action(() => {
    require('../command/update.js')()
  })
program.parse(process.argv) // 解析cli 输入命令行参数，必须

// 如输入cli 命令行参数无，则提示cli 命令
if (!program.args.length) {
  program.help();
}
