'use strict';
const fs = require('fs'); // node.js 文件系统
const exec = require('child_process').exec; // 启动一个新进程，用来执行命令
const config = require('../templates'); // 引入定义好的基础项目列表
const chalk = require('chalk'); // 给提示语添加色彩
const clear = require('clear'); // 清除命令
const figlet = require('figlet'); // 定制cli执行时的头部
const inquirer = require('inquirer'); // 提供交互式命令
const handlebars = require('handlebars'); // 模板语言
const clui = require('clui'); // 提供等待的状态
const Spinner = clui.Spinner;
const status = new Spinner('正在下载...')
const removeDir = require('../lib/remove'); // 删除文件和文件夹

module.exports = () => {
  let gitUrl;
  let branch;
  clear();
  
  // 定制酷炫头部
  console.log(chalk.yellow(figlet.textSync('lissome-cli', {
    horizontalLayout: 'controlled smushing'
  })));
  inquirer.prompt([
    {
      name: 'templateName',
      type: 'list',
      message: '请选择你需要的模板',
      choices: Object.keys(config.templates)
    },
    {
      name: 'projectName',
      type: 'input',
      message: '请输入你的项目名称',
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return '请输入你的项目名称';
        }
      }
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(config))
    gitUrl = config.templates[answers.templateName].url;
    branch = config.templates[answers.templateName].branch;
    // let cmdStr = `git clone ${gitUrl} ${answers.projectName} && cd ${answers.projectName} && git checkout ${branch}`;
    let cmdStr = `git clone ${gitUrl} ${answers.projectName} && cd ${answers.projectName} && git checkout ${branch}`;
    status.start()
    exec(cmdStr, (error, stdou, stderr) => {
      status.stop();
      if (error) {
        console.log('发生了一个错误：', chalk.red(JSON.stringify(error)));
        process.exit();
      }
      const meta = {
        name: answers.projectName
      }
      // 项目模板中的package.json文件中的字段name，应变为"name":"{{name}}"形式，用于后期的字符模板替换
      const content = fs.readFileSync(`${answers.projectName}/package.json`).toString();
      // 利用handlebars.compile 来进行 {{name}}的替换
      const result = handlebars.compile(content)(meta);
      fs.writeFileSync(`${answers.projectName}/package.json`, result);
      // 删除模板自带的git文件，如果有的话
      console.log(chalk.green(`${answers.projectName}/.git`));
      removeDir(`${answers.projectName}/.git`);
      console.log(chalk.green('\n √ 下载完成!'));
      console.log(chalk.cyan(`\n cd ${answers.projectName} && lissome-cli dk && npm install \n`));
      process.exit();
    })
  })
  .catch(error => {
    console.log(error);
    console.log('发生了一个错误：', chalk.red(JSON.stringify(error)));
    process.exit();
  });
}
