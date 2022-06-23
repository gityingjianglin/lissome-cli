const fs = require('fs');
let path = require('path');
const { config } = require('process');

function removeDir(dir) {
  // 返回一个包含指定目录下所有文件名称的数组对象
  console.log(dir);
  let files = fs.readdirSync(dir);
  for (let i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i]);
    let stat = fs.statSync(newPath); // 获取文件对象 fs.Stats对象
    if (stat.isDirectory()) {
      // 判断是否是文件夹，如果是文件夹就递归该文件夹，直到文件全部删除
      removeDir(newPath)
    } else {
      // 删除文件
      fs.unlinkSync(newPath);
    }
  }
  // 删除目录本身的文件夹
  fs.rmdirSync(dir);
};

module.exports = removeDir;