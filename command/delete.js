'use strict';
const fs = require('fs')
const config = require('../templates'); // 引入定义好的基础项目列表
const chalk = require('chalk'); // 给提示语添加色彩
const inquirer = require('inquirer'); // 提供交互式命令
const clear = require('clear'); // 清除命令

module.exports = () => {
  clear();
  inquirer.prompt([
    {
      name: 'templateName',
      type: 'input',
      message: '请输入要删除的模板名称',
      validate: function (value) {
        if (!value.length) {
          return '请输入要删除的模板名称';
        } else {
          if (!config.templates[value]) {
            return '模板不存在，请重新输入';
          } else {
            return true
          }
        }
      }
    }
  ])
  .then((res) => {
    config.templates[res.templateName] = undefined;
    fs.writeFile(__dirname + '/../templates.json', JSON.stringify(config), 'utf-8', (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(chalk.green('模板已删除！'));
      }
      process.exit();
    })
  })
  .catch(error => {
    console.log(error);
    console.log('发生了一个错误：', chalk.red(JSON.stringify(error)));
    process.exit();
  })
}
