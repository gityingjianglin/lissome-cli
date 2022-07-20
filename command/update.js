/*
 * @Author: yingjianglin
 * @Date: 2022-07-06 15:28:52
 * @LastEditors: yingjianglin
 * @LastEditTime: 2022-07-06 15:36:44
 * @Description:  
 * 
 */
const updateNotifier = require('update-notifier'); // 更新CLI应用程序的通知
const chalk = require('chalk');
const pkg = require('../package.json');

const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60, // 默认为1天 1000*60*60*24
})

function updateCheck() {
  if (notifier.update) {
    console.log(`有新版本可用：${chalk.cyan(notifier.update.latest)}，建议您在使用前进行更新`);
  } else {
    console.log(chalk.cyan('已经是最新版本'));
  }
}

module.exports = updateCheck;
