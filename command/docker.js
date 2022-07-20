'use strict';
const fs = require('fs'); // node.js 文件系统
const exec = require('child_process').exec; // 启动一个新进程，用来执行命令
const path = require('path');

const dockerConfig = require('../docker.json'); // 引入docker配置
const chalk = require('chalk'); // 给提示语添加色彩
const clear = require('clear'); // 清除命令
const figlet = require('figlet'); // 定制cli执行时的头部
const inquirer = require('inquirer'); // 提供交互式命令
const handlebars = require('handlebars'); // 模板语言
const clui = require('clui'); // 提供等待的状态
const Spinner = clui.Spinner;
const status = new Spinner('正在下载...')
const removeDir = require('../lib/remove'); // 删除文件和文件夹
const copyfile = require("../lib/copyfile")

module.exports = () => {
  clear();
  
  // 定制酷炫头部
  console.log(chalk.yellow(figlet.textSync('lissome-cli', {
    horizontalLayout: 'controlled smushing'
  })));
  inquirer.prompt([
    {
      name: 'projectGitUrl',
      type: 'input',
      message: '请输入你的项目gitlab地址，目前支持使用http克隆',
      validate: function (value) {
        if (value.length) {
          if (value.indexOf('.git') > -1) {
            return true
          } else {
            return '请输入以.git结尾的gitlab项目地址';
          }
        } else {
          return '请输入你的gitlab项目地址';
        }
      }
    },
    /* {
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
    }, */
    {
      name: 'groupName',
      type: 'input',
      message: '请输入你的项目所属分组名称',
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return '请输入你的项目所属分组名称';
        }
      }
    },
    {
      name: 'dist',
      type: 'input',
      message: '请输入你的项目打包包名',
      default: 'dist'
    },
    {
      name: 'buildCmd',
      type: 'input',
      message: '请输入你的项目打包构建命令',
      default: 'npm run build'
    },
    {
      name: 'port',
      type: 'input',
      message: '请输入你的项目对外端口号（如目前没有，可后期补录）',
      default: '30080'
    },
  ])
  .then(answers => {
    console.log(answers)
    let projectGitUrl = answers.projectGitUrl;
    projectGitUrl = projectGitUrl.replace(/https:\/\//, '').replace(/http:\/\//, '');
    let projectName = ''
    let lastLine = projectGitUrl.lastIndexOf('/')
    let lastDot = projectGitUrl.lastIndexOf('.')
    projectName = projectGitUrl.slice(lastLine + 1, lastDot)
    console.log('projectName:', projectName)

    let dockerTempDir = 'dockerTempDir'
    let dockerGitUrl = dockerConfig.docker.url
    let branch = dockerConfig.docker.branch
    let cmdStr = `git clone ${dockerGitUrl} ${dockerTempDir} && cd ${dockerTempDir} && git checkout ${branch}`;
    status.start()
    exec(cmdStr, (error, stdou, stderr) => {
      status.stop();
      if (error) {
        console.log('发生了一个错误：', chalk.red(JSON.stringify(error)));
        process.exit();
      }
      console.log(chalk.green('\n 开始删除git文件!'));
      removeDir(`${dockerTempDir}/.git`);
      const contentDeploy = fs.readFileSync(`${dockerTempDir}/deploy-svc.yaml`).toString();
      const contentDeplayPrd = fs.readFileSync(`${dockerTempDir}/deploy-svc-prd.yaml`).toString();
      const contentDockerFile = fs.readFileSync(`${dockerTempDir}/Dockerfile-online`).toString();
      const contendJenkinsFile = fs.readFileSync(`${dockerTempDir}/Jenkinsfile-online`).toString();
      const meta = {
        'group-name': answers.groupName,
        'project-name': projectName,
        'git-url': projectGitUrl,
        dist: answers.dist,
        port: answers.port,
        'build-cmd': answers.buildCmd
      }
      const resultDeploy = handlebars.compile(contentDeploy)(meta);
      const resultDeplayPrd = handlebars.compile(contentDeplayPrd)(meta);
      const resultDockerFile = handlebars.compile(contentDockerFile)(meta);
      const resultJenkinsFile = handlebars.compile(contendJenkinsFile)(meta);
      fs.writeFileSync(`${dockerTempDir}/deploy-svc.yaml`, resultDeploy);
      fs.writeFileSync(`${dockerTempDir}/deploy-svc-prd.yaml`, resultDeplayPrd);
      fs.writeFileSync(`${dockerTempDir}/Dockerfile-online`, resultDockerFile);
      fs.writeFileSync(`${dockerTempDir}/Jenkinsfile-online`, resultJenkinsFile);
      copyfile('./dockerTempDir', './').then(() => {
        console.log(chalk.green('\n √ 容器化文件复制完成!'));
        removeDir(`${dockerTempDir}`);
        process.exit();
      })
    })
    
    /* console.log(JSON.stringify(config))
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
      console.log(chalk.cyan(`\n cd ${answers.projectName} && npm install \n`));
      process.exit();
    }) */
  })
  .catch(error => {
    console.log(error);
    console.log('发生了一个错误：', chalk.red(JSON.stringify(error)));
    process.exit();
  });
}
