const { switchVersion, loadModule } = require('./utils')
const { resolve } = require('path')
const mainPath = resolve(process.cwd(), '../')

var fs = require( 'fs' );
var path = require("path");  

function writeFile(p,text){
    fs.writeFile(p, text,function (err) {
        if (!err)
          console.log("写入成功！")
      })
}

//递归创建目录 同步方法  
function mkdirsSync(dirname) {  
    if (fs.existsSync(dirname)) {  
      return true;
    } else {  
        if (mkdirsSync(path.dirname(dirname))) {  
            console.log("mkdirsSync = " + dirname);
            fs.mkdirSync(dirname);
            return true;
        }  
    }  
}

function _copy(src, dist) {
  var paths = fs.readdirSync(src)
  paths.forEach(function(p) {
    var _src = src + '/' +p;
    var _dist = dist + '/' +p;
    var stat = fs.statSync(_src)
    if(stat.isFile()) {// 判断是文件还是目录
      fs.writeFileSync(_dist, fs.readFileSync(_src));
    } else if(stat.isDirectory()) {
      copyDir(_src, _dist)// 当是目录是，递归复制
    }
  })
}

/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src,dist){
  var b = fs.existsSync(dist)
  console.log("dist = " + dist)
  if(!b){
    console.log("mk dist = ",dist)
    mkdirsSync(dist);//创建目录
  }
  console.log("_copy start")
  _copy(src,dist);
}

function createDocs(src,dist,callback){
  console.log("createDocs...")
  copyDir(src,dist);
  console.log("copyDir finish exec callback")
  if(callback){
    callback();
  }
}



let resourseArr = [];
mainPath.replace(/(.*?node_modules)/g, (match, p1, offset,) => {
  resourseArr.push(`${mainPath.substring(0, offset)}${p1}`)
});

let resourseArrLen = 0;
let from = `${mainPath}\\@vue\\composition-api`
// let to = `${process.cwd()}\\composition-api`
let to = `${resolve(process.cwd(), '../../../')}\\@vue\\composition-api`
console.log('bbb',from)
console.log('bbb',to)
for (let item of resourseArr) {
  const Vue = loadModule(`${item}\\vue`)
  if (Vue && typeof Vue.version === 'string') {
    if (Vue.version.startsWith('2.')) {
      switchVersion(2)
      createDocs(from, to,function(){

      })
    }
    else if (Vue.version.startsWith('3.')) {
      switchVersion(3)
    }
    else {
      console.warn(`[vue-demi] Vue version v${Vue.version} is not suppported.`)
    }
    resourseArrLen++
    break;
  }
}

if (resourseArrLen === resourseArr.length) {
  console.warn('[vue-demi] Vue is not found. Please run "npm install vue" to install.')
}
