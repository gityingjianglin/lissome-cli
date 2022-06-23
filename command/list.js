'use strict';
const config = require('../templates'); // 引入定义好的基础项目列表
const chalk = require('chalk'); // 给提示语添加色彩

module.exports = () => {
  let str = ''
  Object.keys(config.templates).forEach((item, index, array) => {
    if (index === array.length - 1) {
      str += item;
    } else {
      str += `${item} \n`;
    }
  });
  console.log(chalk.cyan(str));
  process.exit();
}