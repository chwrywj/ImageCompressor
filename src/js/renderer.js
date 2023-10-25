new Vue({
    el: "#body-container",
    data() {
        return {
            langRes:null,

            imgDataStatus:null,
            imgData:[],
            tableLoading:false,
            pageIndex: 1,
            pageSize: 200,
            multipleSelection: [],

            compressIng:false,

            settingCollapseActiveNames: ['1','2','3','4'],
            compressOptions:{
                jpg:{
                    quality: 70 //0-100 The higher the value, the better the quality
                },
                png:{
                    speed: 3, //1-11 Compression speed, the higher the value, the faster the compression speed, but the quality will decrease
                    quality: [5, 8] //0-1 The larger the number, the better the quality
                },
                gif:{
                    optimizationLevel: 3, //1-3 The larger the number, the worse the quality, but the faster the processing speed
                    colors: 70 //2-256 The larger the number, the higher the quality
                }
            },
            outputDirType:"sourcePath",
            outputPath:'',
            // outputDirType:"newPath",
            // outputPath:'D:\\2023',
        }
    },
    computed:{
        imgPageData(){
            this.multipleSelection=[];
            return this.imgData.slice((this.pageIndex-1)*this.pageSize,this.pageIndex*this.pageSize);
        },

        imgCompressPercent(){
            if(this.imgData.length==0)
                return 0;
            var filterData = this.imgData.filter(item => {
                return item.status != 0
            });
            return parseInt((filterData.length/this.imgData.length)*100,10);
        }
    },
    mounted() {
        setTimeout(()=>{
            document.title = this.lang("title");
            this.imgDataStatus = {
                0:this.lang('unCompress'),
                1:this.lang('compressIng'),
                2:this.lang('compressSuccess'),
                3:this.lang('compressFail'),
            }
        },100)
    },
    methods: {
        //multilingual
        getLangStr(key){
            var keyArr=key.split('.');
            var langObj=this.langRes[keyArr[0]];
            for(var i=1;i<keyArr.length;i++){
                langObj=langObj[keyArr[i]];
            }
            return langObj;
        },
        lang(key){
            if(this.langRes==null){
                window.customApi.getLangRes()
                .then(data=>{
                    this.langRes=data;
                    return this.getLangStr(key);
                })
                .catch((e) => {
                    return key;
                });
            }else{
                return this.getLangStr(key);
            }
        },

        async openFileDialog(){
            const filePaths = await window.electronAPI.openFile()
            this.tableLoading=true;
            if(filePaths!=null && filePaths.length>0){
                this.tableLoading=true;
                setTimeout(()=>{
                    for(var i=0;i<filePaths.length;i++){
                        var filterData = this.imgData.filter(item => {
                            return item.sourceFilePath == filePaths[i]
                        });
                        if(filterData.length>0){
                            continue;
                        }
    
                        this.imgData.push({
                            sourceFilePath:filePaths[i],
                            newFilePath:null,
                            sourceFileSize:window.electronAPI.getFileSize(filePaths[i]),
                            newFileSize:null,
                            status:0
                        });
                    }
                    this.tableLoading=false;
                },50);
            }
            this.tableLoading=false;
        },
        
        async openDirectory(dirType){
            const dirPaths = await window.electronAPI.openDirectory()
            if(dirType=="output"){
                this.outputPath = dirPaths
            }else if(dirType=="input"){
                var fileData = window.electronAPI.getFilesFromDir(dirPaths,['.jpg','.jpeg','.png','.gif']);
                if(fileData!=null && fileData.length>0){
                    this.tableLoading=true;
                    setTimeout(()=>{
                        for(var i=0;i<fileData.length;i++){
                            var filterData = this.imgData.filter(item => {
                                return item.sourceFilePath == fileData[i].filePath
                            });
                            if(filterData.length>0){
                                continue;
                            }
    
                            this.imgData.push({
                                sourceFilePath:fileData[i].filePath,
                                newFilePath:null,
                                sourceFileSize:fileData[i].fileSize,
                                newFileSize:null,
                                status:0
                            });
                        }
                        this.tableLoading=false;
                    },50);
                }
            }
        },

        showCompressStatus(status){
            if(status==0){
                return this.imgDataStatus[status];
            }else if(status==1){
                return "<span style='color:#409EFF'>"+this.imgDataStatus[status]+"</span>";
            }else if(status==2){
                return "<span style='color:#67C23A'>"+this.imgDataStatus[status]+"</span>";
            }else if(status==3){
                return "<span style='color:#F56C6C'>"+this.imgDataStatus[status]+"</span>";
            }
        },

        pageIndexChange(e) {
            this.pageIndex = e;
        },
        pageSizeChange(e) {
            this.pageSize = e;
            this.pageIndex =1
        },

        dataListMultiSelect(val) {
            this.multipleSelection = [];
            if(val!=null && val.length>0){
                val.forEach((item) => {
                    this.multipleSelection.push(item.sourceFilePath);
                });
            }
        },

        delImgData(){
            this.$confirm(this.lang('delConfirm'), this.lang('tip'), {
                confirmButtonText: this.lang('ok'),
                cancelButtonText: this.lang('cancel')
            }).then(() => {
                var startIndex=this.pageIndex*this.pageSize;
                if(startIndex>this.imgData.length)
                    startIndex=this.imgData.length;
                startIndex=startIndex-1;
                for(var i=startIndex;i>=(this.pageIndex-1)*this.pageSize;i--){
                    if(this.multipleSelection.includes(this.imgData[i].sourceFilePath)){
                        this.imgData.splice(i,1);
                    }
                }
                this.$message({
                    type: 'success',
                    message: this.lang('delSuccess')
                });
            });
        },

        renameForNewFile(filePath){
            var filterData = this.imgData.filter(item => {
                return item.newFilePath == filePath
            });
            if(filterData.length>0){
                return this.renameForNewFile(filePath.replace(".","(1)."));
            }
            return filePath;
        },

        async compressImg(){
            if(this.outputDirType=="newPath" && (this.outputPath==null || this.outputPath=='')){
                this.$message.warning(this.lang('selectOutputDirTip'));
                return;
            }
            if(this.imgCompressPercent==100)
                return;
            if(this.compressIng){
                this.compressIng=false;
                return;
            }
            
            this.compressIng=true;

            for(var i=0;i<this.imgData.length;i++){
                if(!this.compressIng)
                    return;

                var j=i;

                if(this.imgData[j].status!=0){
                    continue;
                }

                var outputPath=null;
                var newFilePath=null;
                if(this.outputDirType=="sourcePath"){
                    outputPath = this.imgData[j].sourceFilePath.replace(/\\/g,"/");
                    outputPath=outputPath.substr(0,outputPath.lastIndexOf('/'));

                    newFilePath = this.imgData[j].sourceFilePath;
                }else{
                    outputPath=this.outputPath.replace(/\\/g,"/");

                    newFilePath=outputPath;
                    if(newFilePath.length==newFilePath.lastIndexOf("/")+1){
                        newFilePath=newFilePath.substr(0,newFilePath.length-1);
                    }
                    var sourceFilePath = this.imgData[j].sourceFilePath.replace(/\\/g,"/");
                    newFilePath=newFilePath+sourceFilePath.substr(sourceFilePath.lastIndexOf('/')); //this.renameForNewFile(newFilePath);
                }

                this.imgData[j].status=1;

                var compressData = await window.electronAPI.compressImgByImagemin(this.imgData[j].sourceFilePath, outputPath, this.compressOptions);
                console.log(compressData)
                if(compressData.status){
                    this.imgData[j].status=2;
                    this.imgData[j].newFileSize=compressData.data[0].data.length;
                    this.imgData[j].newFilePath=newFilePath;
                }else{
                    this.imgData[j].status=3;
                }

                if(this.imgCompressPercent==100){
                    setTimeout(() => {
                        this.$alert(this.lang('compressOver'), this.lang('tip'), {
                            confirmButtonText: this.lang('ok'),
                            callback: action => {
                                this.compressIng=false;
                            }
                        });
                    }, 800);
                }

                // window.electronAPI.compressImgByExe(this.imgData[j].sourceFilePath, outputPath, this.compressOptions);
                // this.imgData[j].status=2;
                // if(this.imgCompressPercent==100){
                //     setTimeout(() => {
                //         this.$alert(this.lang('compressOver'), this.lang('tip'), {
                //             confirmButtonText: this.lang('ok'),
                //             callback: action => {
                //                 this.compressIng=false;
                //             }
                //         });
                //     }, 800);
                // }
            }
        },

        openBrowser(url){
            window.electronAPI.openBrowser(url);
        },

        openPath(url){
            window.electronAPI.openPath(url);
        }
    }
});