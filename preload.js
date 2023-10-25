const { contextBridge, ipcRenderer, shell } = require('electron')
const fs = require('fs');
const path = require('path');
const os = require('os');
const {spawn} = require('child_process');
const imagemin = require('./src/js/imagemin');

contextBridge.exposeInMainWorld('electronAPI', {
  openBrowser: (url) => {
    shell.openExternal(url);
  },
  
  openPath: (url) => {
    shell.openPath(url);
  },

  openFile: () => ipcRenderer.invoke('dialog:openFile'),

  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),

  getFilesFromDir: (inputPath,extnameArr) => {
    var fileData=[];
    const readImgFilePath = (directoryPath) => {
        directoryPath = path.resolve(directoryPath);
        const files = fs.readdirSync(directoryPath);
        files.forEach((file) => {
            const filePath  = path.join(directoryPath, file);
            const stat = fs.statSync(filePath);
            if (stat.isFile()) {
              var extname = path.extname(file).toLocaleLowerCase();
              if(extname!=null && extname!='' && extnameArr.includes(extname)){
                fileData.push({
                  filePath:filePath,
                  fileSize:stat.size
                })
              }
            } else if (stat.isDirectory()){
              readImgFilePath(filePath);
            }
        });
    }
    readImgFilePath(inputPath);
    return fileData;
  },

  getFileSize:(filePath)=>{
    filePath = path.resolve(filePath);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      return stat.size;
    }else{
      return null;
    }
  },
  
  //使用imagemin包
  compressImgByImagemin: async (input, output, opts) => {
    try{
      return await imagemin.compress(input, output, opts)
    }catch(e){
      console.log(e);
      return {
          status: false
      };
    }
  },
  
  //使用exe文件
  compressImgByExe: (input, output, opts) => {
    try{
      const platform = os.platform()
      const arch = os.arch()
      const basePath = path.resolve(
        __dirname.replace('app.asar', 'app.asar.unpacked'),
        'bin',
        platform,
        // arm64 is limit supported only for macOS
        platform === 'darwin' && arch === 'arm64'
          ? 'arm64'
          : 'x64',
      )
      var name='pngquant';
      var binPath = path.resolve(
        basePath,
        platform === 'win32' ? `${name}.exe` : name,
      )

      var fileParse = path.parse(input)
      var filesExt=fileParse.ext.toLocaleLowerCase();
      var outputFileFullPath=output+`/${fileParse.name}${fileParse.ext}`;
      var spawnArgs=[
        '50',
        input,
        '-o',
        outputFileFullPath,
      ];
      spawn(binPath, spawnArgs, {
        capture: ['stdout', 'stderr'],
        env: {
          ...process.env,
          LD_LIBRARY_PATH: basePath,
        },
      })
    }catch(e){
      console.log(e);
    }
  },
})

contextBridge.exposeInMainWorld('customApi', {
  getLangRes: () => {
    var langList=["bg", "cs", "da", "de", "el", "en", "es", "et", "fi", "fr", "hu", "it", "ja", "ko", "nl", "pl", "pt", "ro", "ru", "sl", "sv", "th", "vi", "zh", "zh-tw"];

    return ipcRenderer.invoke('getLocale')
    .then(data=>{
      var langCode = data;
      if (langCode == "zh-hk"){
          langCode = "zh-tw";
      }
      if(!langList.includes(langCode)){
        if(langCode.indexOf('-')!=-1){
          langCode=langCode.substring(0,langCode.indexOf('-'));
        }
        if(!langList.includes(langCode)){
          langCode="en";
        }
      }
      return require('./locales/'+langCode+'.json');
    })
    .catch((e) => {
      return require('./locales/en.json');
    });
  },
})