const { switchVersion, loadModule, createDocs } = require('./utils');
const { resolve } = require('path');
const mainPath = resolve(process.cwd(), '../');

let resourseArr = [];
mainPath.replace(/(.*?node_modules)/g, (match, p1, offset) => {
  resourseArr.push(`${mainPath.substring(0, offset)}${p1}`);
});

let resourseArrLen = 0;
let from = `${mainPath}\\@vue\\composition-api`;
let to = ``;
console.log('bbbb', mainPath)
let ttttPath = process.cwd() + '\\node_modules'
console.log('cccc', ttttPath)
const readPkg = require('read-pkg');
const writePackage = require('write-pkg');


for (let item of resourseArr) {
  console.log('item', item)
  const Vue = loadModule(`${item}\\vue`);
  if (Vue && typeof Vue.version === 'string') {
    to = `${item}\\@vue\\composition-api`;
    console.log('bbb', from);
    console.log('bbb', to);
    const compositionApi = loadModule(to);
    let pkgPath = resolve(item, '../')
    let pkg = readPkg.sync({ cwd: pkgPath })


    if (Vue.version.startsWith('2.')) {
      switchVersion(2);


      const { execSync } = require('child_process');
      const fs = require('fs');
      const path = require('path')
      const os = require('os')
      let tempDirectory = ''
      fs.mkdtemp(path.join(os.tmpdir(), '目录-'), (err, directory) => {
        if (err) throw err;
        tempDirectory = directory
        console.log('中专目录名称', directory);
        // 打印: /tmp/目录-itXde2 或 C:\Users\...\AppData\Local\Temp\目录-itXde2
        // let tempPath = 'C:\\Users\\Superman\\AppData\\Local\\Temp\\目录-pHNaFQ'
        process.chdir(tempDirectory)
        execSync(`yarn add @vue/composition-api`, { encoding: 'utf8', stdio: [0, 1, 2] });
        // process.chdir(process.cwd())

        if (mainPath.includes('node_modules')) {
          const loadJsonFile = require('load-json-file');
  
          let compositionApiVersion = '';
          (async () => {
            let tempPackage = await loadJsonFile(tempDirectory + '\\package.json')
            compositionApiVersion = tempPackage.dependencies['@vue/composition-api']
            console.log(compositionApiVersion);
            //=> {foo: true}
          })();
  
          const writeJsonFile = require('write-json-file');
  
          (async () => {
            let writePath = resolve(item, '../package.json');
            let tempPackage = await loadJsonFile(writePath)
            // console.log('主文件', yarnIntegrity)
            tempPackage.dependencies['@vue/composition-api'] = compositionApiVersion
            console.log('主文件2', writePath)
            await writeJsonFile(writePath, tempPackage);
          })();

          // const loadJsonFile = require('load-json-file');
  
          // let lockfileEntries = {};
          // (async () => {
          //   let yarnIntegrity = await loadJsonFile(tempDirectory + '\\node_modules\\.yarn-integrity')
          //   lockfileEntries = yarnIntegrity.lockfileEntries
          //   console.log(lockfileEntries);
          //   //=> {foo: true}
          // })();
  
          // const writeJsonFile = require('write-json-file');
  
          // (async () => {
          //   let writePath = item + '\\.yarn-integrity'
          //   let yarnIntegrity = await loadJsonFile(writePath)
          //   // console.log('主文件', yarnIntegrity)
          //   Object.assign(yarnIntegrity.lockfileEntries, lockfileEntries)
          //   console.log('主文件2', writePath)
          //   await writeJsonFile(writePath, yarnIntegrity);
          // })();
          
        }
  
        if (!compositionApi && from !== to) {
          console.log('复制')
          createDocs(tempDirectory + '\\node_modules\\@vue\\composition-api', to, () => { });
        }

      });




    } else if (Vue.version.startsWith('3.')) {
      switchVersion(3);
    } else {
      console.warn(`[vue-demi] Vue version v${Vue.version} is not suppported.`);
    }
    if (compositionApi) {
      console.log('获取的数据', compositionApi)
      const version = compositionApi.version
      pkg.dependencies['@vue/composition-api'] = `^${version}`
      delete pkg.readme
      delete pkg._id
      writePackage.sync(pkgPath, pkg);
    }

    console.log('获取的数据', pkg)
    resourseArrLen++;
    break;
  }
}

if (resourseArrLen === resourseArr.length) {
  console.warn('[vue-demi] Vue is not found. Please run "npm install vue" to install.');
}
