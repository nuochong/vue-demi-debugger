const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..', 'lib');

function loadModule(name) {
  try {
    return require(name);
  } catch (e) {
    return undefined;
  }
}

function copy(name, version, vue) {
  vue = vue || 'vue';
  const src = path.join(dir, `v${version}`, name);
  const dest = path.join(dir, name);
  let content = fs.readFileSync(src, 'utf-8');
  content = content.replace(/'vue'/g, `'${vue}'`);
  fs.writeFileSync(dest, content, 'utf-8');
}

function updateVue2API() {
  const ignoreList = ['version', 'default'];
  const VCA = loadModule('@vue/composition-api');
  if (!VCA) {
    console.warn('[vue-demi] Composition API plugin is not found. Please run "npm install @vue/composition-api" to install.');
    return;
  }

  const exports = Object.keys(VCA).filter((i) => !ignoreList.includes(i));

  const esmPath = path.join(dir, 'index.esm.js');
  let content = fs.readFileSync(esmPath, 'utf-8');

  content = content.replace(
    /\/\*\*VCA-EXPORTS\*\*\/[\s\S]+\/\*\*VCA-EXPORTS\*\*\//m,
    `/**VCA-EXPORTS**/
export { ${exports.join(', ')} } from '@vue/composition-api'
/**VCA-EXPORTS**/`
  );

  fs.writeFileSync(esmPath, content, 'utf-8');
}

function switchVersion(version, vue) {
  copy('index.cjs.js', version, vue);
  copy('index.esm.js', version, vue);
  copy('index.d.ts', version, vue);

  if (version === 2) updateVue2API();
}



function writeFile(p, text) {
  fs.writeFile(p, text, function (err) {
    if (!err) console.log('写入成功！');
  });
}

//递归创建目录 同步方法
function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      console.log('mkdirsSync = ' + dirname);
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

function _copy(src, dist) {
  const paths = fs.readdirSync(src);
  paths.forEach(function (p) {
    const _src = src + '/' + p;
    const _dist = dist + '/' + p;
    const stat = fs.statSync(_src);
    if (stat.isFile()) {
      // 判断是文件还是目录
      fs.writeFileSync(_dist, fs.readFileSync(_src));
    } else if (stat.isDirectory()) {
      copyDir(_src, _dist); // 当是目录是，递归复制
    }
  });
}

/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist) {
  const b = fs.existsSync(dist);
  console.log('dist = ' + dist);
  if (!b) {
    console.log('mk dist = ', dist);
    mkdirsSync(dist); //创建目录
  }
  console.log('_copy start');
  _copy(src, dist);
}

function createDocs(src, dist, callback) {
  console.log('createDocs...');
  copyDir(src, dist);
  console.log('copyDir finish exec callback');
  if (callback) {
    callback();
  }
}

// which-pm-runs
function whichPMRuns() {
  if (!process.env.npm_config_user_agent) {
    return undefined
  }
  return pmFromUserAgent(process.env.npm_config_user_agent)
}

function pmFromUserAgent (userAgent) {
  const pmSpec = userAgent.split(' ')[0]
  const separatorPos = pmSpec.lastIndexOf('/')
  return {
    name: pmSpec.substr(0, separatorPos),
    version: pmSpec.substr(separatorPos + 1)
  }
}


module.exports.loadModule = loadModule;
module.exports.switchVersion = switchVersion;

module.exports.createDocs = createDocs;
module.exports.whichPMRuns = whichPMRuns;