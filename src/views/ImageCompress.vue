<template>
    <div class="my-container">
        <div class="left">
            <template v-if="(fileData==null || fileData.length==0) && !tableLoading">
                <div class="add-file-cover">
                    <i class="my-icon my-icon-add-image" @click="dialogOpenFile"></i>
                    <div class="tip">{{$t('imageCompress.tip')}}<br/>{{$t('common.addFileTip')}}{{imageExtArr.join(', ')}}</div>
                    <div class="add-filt-btn-box">
                        <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenFile">
                            <i class="my-icon my-icon-file"></i>
                            <span>{{$t('common.addImageBtn')}}</span>
                        </el-button>
                        <el-tooltip :content="$t('common.addDirTip')" placement="top">
                            <el-button type="primary" size="large" class="add-file-btn" plain @click="dialogOpenDirectory('input')">
                                <i class="my-icon my-icon-folder"></i>
                                <span>{{$t('common.addDirBtn')}}</span>
                            </el-button>
                        </el-tooltip>
                    </div>
                </div>
            </template>
            <template v-else>
                <div class="table-top">
                    <el-button type="primary" size="small" @click="dialogOpenFile" :disabled="processIng">
                        <i class="my-icon my-icon-file"></i>
                        <span>{{$t('common.addImageBtn')}}</span>
                    </el-button>
                    <el-tooltip :content="$t('common.addDirTip')" placement="top">
                        <el-button type="primary" size="small" @click="dialogOpenDirectory('input')" :disabled="processIng">
                            <i class="my-icon my-icon-folder"></i>
                            <span>{{$t('common.addDirBtn')}}</span>
                        </el-button>
                    </el-tooltip>
                    <el-button type="danger" size="small" @click="fileData=[]" :disabled="processIng">
                        <i class="my-icon my-icon-delete"></i>
                        <span>{{$t('common.clearFile')}}</span>
                    </el-button>
                </div>
                <el-table
                    v-loading="tableLoading"
                    :data="filePageData"
                    size="small"
                    border
                    style="width: 100%;"
                    :header-cell-style="{backgroundColor:'#f5f7fa',color:'#606266'}">
                    <el-table-column prop="sourcePath" :label="$t('common.sourcePath')" min-width="150px">
                        <template #default="scope">
                            <div @click="openPath(scope.row.sourcePath)" style="cursor: pointer;">{{scope.row.sourcePath}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceSize" :label="$t('common.sourceSize')" min-width="80px" align="right">
                        <template #default="scope">
                                {{transSizeDesc(scope.row.sourceSize)}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceResolution" :label="$t('common.sourceResolution')" min-width="90px" align="right">
                        <template #default="scope">
                            {{scope.row.sourceWidth!=null && scope.row.sourceHeight!=null?scope.row.sourceWidth+"x"+scope.row.sourceHeight:""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="newPath" :label="$t('common.newPath')" min-width="150px">
                        <template #default="scope">
                            <div @click="openPath(scope.row.newPath)" style="cursor: pointer;">{{scope.row.newPath}}</div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="newSize" :label="$t('common.newSize')" min-width="80px" align="right">
                        <template #default="scope">
                                {{transSizeDesc(scope.row.newSize)}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="newResolution" :label="$t('common.newResolution')" min-width="90px" align="right">
                        <template #default="scope">
                            {{scope.row.newWidth!=null && scope.row.newHeight!=null?scope.row.newWidth+"x"+scope.row.newHeight:""}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="status" :label="$t('common.status')" width="100px" fixed="right">
                        <template #default="scope">
                            <span v-html="showCompressStatus(scope.row.status)"></span>
                        </template>
                    </el-table-column>
                    <el-table-column width="40px" fixed="right">
                        <template #default="scope">
                            <div class="operate">
                                <i class="my-icon my-icon-cuo" :class="{'disabled': processIng}" @click="delFileData(scope)"></i>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="table-data-page">
                    <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :pager-count="5"
                        small
                        :total="fileData.length"
                        :page-size="pageSize"
                        :current-page="pageIndex"
                        @current-change="pageIndexChange">
                    </el-pagination>
                </div>
            </template>
        </div>
        <div class="setting">
            <div class="title">{{$t('imageCompress.compressSetting')}}</div>
            <el-form :model="processOptions" :rules="processOptionsRules" ref="compressOptionsForm" label-position="top" size="small">
                <!-- <el-form-item>
                    <template #label>
                        <el-tooltip :content="$t('common.taskThreadsNumberTip')" placement="top">
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('common.taskThreadsNumber')}}
                    </template>
                    <el-slider class="content slider" v-model="processOptions.taskThreadsNumber" :disabled="processIng" :min="1" :max="5"></el-slider>
                </el-form-item> -->
                <el-form-item>
                    <template #label>
                        <el-tooltip :content="$t('imageCompress.qualityTip')" placement="top">
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('imageCompress.quality')}}
                    </template>
                    <el-slider class="content slider" v-model="processOptions.quality" :disabled="processIng" :min="1" :max="100"></el-slider>
                </el-form-item>
                <el-form-item :label="$t('common.imageResolution')">
                    <el-select class="content" v-model="processOptions.resolution" :disabled="processIng" :placeholder="$t('common.selectTip')">
                        <el-option v-for="(item,key) in resolutionArr" :key="key" :label="item" :value="key"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item v-if="processOptions.resolution=='customMax'" prop="customResolution">
                    <template #label>
                        <el-tooltip placement="top">
                            <template #content>
                                <div  style="line-height: 24px;">{{$t('common.customResolutionTip1')}}<br/>{{$t('common.customResolutionTip2')}}<br/>{{$t('common.customResolutionTip3')}}<br/>{{$t('common.customResolutionTip4')}}</div>
                            </template>
                            <i class="my-icon my-icon-help"></i>
                        </el-tooltip>
                        {{$t('common.customMaxResolution')}}
                    </template>
                    <div style="display: flex;">
                        <el-input class="content" 
                            v-model="processOptions.customImageWidth" 
                            :disabled="processIng" 
                            :placeholder="$t('common.maxWidth')" 
                            clearable>
                        </el-input>
                        <span style="padding:0 3px;">x</span>
                        <el-input class="content" 
                            v-model="processOptions.customImageHeight" 
                            :disabled="processIng" 
                            :placeholder="$t('common.maxHeight')" 
                            clearable>
                        </el-input>
                    </div>
                </el-form-item>
                <el-form-item v-if="processOptions.resolution=='proportionForResolution'" 
                    :label="$t('common.proportionForResolution')" 
                    prop="proportionForResolution" 
                    :rules="[{required: true, message: $t('common.inputTip'), trigger: 'blur'},{ pattern: /^[0-9]+$/, message: $t('common.mustBeInt'), trigger: 'blur' }]">
                    <el-input class="content" v-model="processOptions.proportionForResolution" :disabled="processIng" clearable>
                        <template #append>
                            %
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item :label="$t('common.outDir')" prop="outputPath" :rules="{required: true, message: $t('common.selectOutputDirTip'), trigger: 'change'}">
                    <el-input class="content" v-model="processOptions.outputPath" :disabled="processIng" clearable>
                        <template #append>
                            <i class="open-folder my-icon my-icon-folder" @click="dialogOpenDirectory('output')"></i>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
            <div class="bottom">
                <el-progress v-if="processIng || fileCompressPercent!=0" :percentage="fileCompressPercent" class="progress" :text-inside="true" :stroke-width="20" text-color="#fff"></el-progress>
                <el-button type="primary" size="large" class="btn-process" @click="goCompress" :disabled="fileData==null || fileData.length==0 || fileCompressPercent==100">
                    {{processIng?$t('imageCompress.compressStop'):$t('imageCompress.compressStart')}}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
    import common from '../utils/common';
    import imageHelper from '../utils/ImageHelper';
    import { toRaw } from '@vue/reactivity'
    export default {
        name: 'ImageCompress',
        data() {
            var checkCustomResolution = (rule, value, callback) => {
                if (this.processOptions.customImageWidth!=null && this.processOptions.customImageWidth!=''){
                    if(isNaN(this.processOptions.customImageWidth) || !/^[0-9]+$/.test(this.processOptions.customImageWidth)){
                        callback(new Error(this.$t('common.mustBeInt')));
                    }
                }
                if (this.processOptions.customImageHeight!=null && this.processOptions.customImageHeight!=''){
                    if(isNaN(this.processOptions.customImageHeight) || !/^[0-9]+$/.test(this.processOptions.customImageHeight)){
                        callback(new Error(this.$t('common.mustBeInt')));
                    }
                }
                callback();
            };

            return {
                imageExtArr:['jpg','jpeg','png','gif','webp','tif','tiff','avif','heif'],

                fileData:[],
                tableLoading:false,
                pageIndex: 1,
                pageSize: 100,

                processIng:false,

                processOptions:{
                    taskThreadsNumber:1,
                    quality:50,
                    resolution:'source',
                    customImageWidth:null,
                    customImageHeight:null,
                    proportionForResolution:100,
                    outputPath:'',
                },
                processOptionsRules: {
                    customResolution: [
                        { validator: checkCustomResolution, trigger: 'blur' }
                    ]
                },
            }
        },
        computed:{
            filePageData(){
                return this.fileData.slice((this.pageIndex-1)*this.pageSize,this.pageIndex*this.pageSize);
            },

            fileCompressPercent(){
                if(this.fileData.length==0)
                    return 0;
                var filterData = this.fileData.filter(item => {
                    return item.status == 2 || item.status == 3
                });
                
                return parseInt((filterData.length/this.fileData.length)*100,10);
            },

            resolutionArr(){
                return {
                    "source":this.$t('common.useSourceResolution'),
                    "customMax":this.$t('common.customMaxResolution'),
                    "proportionForResolution":this.$t('common.proportionResolution')
                };
            }
        },
        methods: {
            toNum(str){
                if(this.isNullOrEmpty(str) || isNaN(str))
                    return null;
                else
                    return Number(str);
            },

            dialogOpenFile(){
                common.dialogOpenFile(toRaw(this.imageExtArr))
                .then(filePaths=>{
                    if(filePaths!=null && filePaths.length>0){
                        this.tableLoading=true;
                        setTimeout(()=>{
                            for(var i=0;i<filePaths.length;i++){
                                var filterData = this.fileData.filter(item => {
                                    return item.sourcePath == filePaths[i]
                                });
                                if(filterData.length>0){
                                    continue;
                                }
                                this.fileData.push({
                                    sourcePath:filePaths[i],
                                    sourceSize:null,
                                    sourceWidth:null,
                                    sourceHeight:null,
                                    newPath:null,
                                    newSize:null,
                                    newWidth:null,
                                    newHeight:null,
                                    status:0
                                });
                            }
                            this.tableLoading=false;
                            this.setMetaData();
                        },100);
                    }
                });
            },

            dialogOpenDirectory(dirType){
                common.dialogOpenDirectory()
                .then(dirPaths=>{
                    if(dirPaths==null || dirPaths=='')
                        return;
                    if(dirType=="output"){
                        this.processOptions.outputPath = dirPaths
                    }else if(dirType=="input"){
                        var fileData = common.getFilesFromDir(dirPaths,toRaw(this.imageExtArr));
                        if(fileData!=null && fileData.length>0){
                            this.tableLoading=true;
                            setTimeout(()=>{
                                for(var i=0;i<fileData.length;i++){
                                    var filterData = this.fileData.filter(item => {
                                        return item.sourcePath == fileData[i].filePath
                                    });
                                    if(filterData.length>0){
                                        continue;
                                    }
            
                                    this.fileData.push({
                                        sourcePath:fileData[i].filePath,
                                        sourceSize:fileData[i].fileSize,
                                        sourceWidth:null,
                                        sourceHeight:null,
                                        newPath:null,
                                        newSize:null,
                                        newWidth:null,
                                        newHeight:null,
                                        status:0
                                    });
                                }
                                this.tableLoading=false;
                                this.setMetaData();
                            },100);
                        }
                    }
                });
            },

            //异步获取媒体参数，防止页面卡顿
            setMetaData(){
                var filterData = this.fileData.filter(item => {
                    return item.sourceWidth == null
                });
                function* gengeratorFun() {
                    for (var i=0;i<filterData.length;i++) {
                        yield getMetaData(filterData[i].sourcePath);
                    }
                }
                
                var getMetaData = (filePath)=>{
                    var curData = this.fileData.filter(item => {
                        return item.sourcePath == filePath
                    });
                    if(curData.length==0){
                        console.log('empty');
                        var emptyData = this.fileData.filter(item => {
                            return item.sourceWidth == null
                        });
                        if(emptyData.length>0){
                            setTimeout(() => {
                                gf.next();
                            }, 30);
                        }
                    }else{
                        imageHelper.getMetaData(filePath,(metaData)=>{
                            try{
                                if(curData[0].sourceSize==null)
                                    curData[0].sourceSize=common.getFileSize(filePath);
                                curData[0].sourceWidth=metaData.width;
                                curData[0].sourceHeight=metaData.height;
                            }catch(e){
                                console.log(e);
                            }
                            gf.next();
                        });
                    }
                }

                var gf = gengeratorFun();
                gf.next();
            },

            transSizeDesc(size){
                if(size==null)
                    return '';
                if(size<1024)
                    return size+'B';
                if(size<1024*1024)
                    return (size/1024).toFixed(2)+"KB";
                return (size/1024/1024).toFixed(2)+"MB";
            },

            showCompressStatus(status){
                if(status==0){
                    return this.$t('imageCompress.unCompress');
                }else if(status==1){
                    return "<span style='color:var(--el-color-primary-dark-2)'>"+this.$t('imageCompress.compressIng')+"</span>";
                }else if(status==2){
                    return "<span style='color:var(--el-color-primary)'>"+this.$t('imageCompress.compressSuccess')+"</span>";
                }else if(status==3){
                    return "<span style='color:var(--el-color-danger)'>"+this.$t('imageCompress.compressFail')+"</span>";
                }
            },

            pageIndexChange(e) {
                this.pageIndex = e;
            },

            delFileData(scope){
                if(this.processIng){
                    return;
                }
                var rowIndex=(this.pageIndex-1)*this.pageSize+scope.$index;
                this.fileData.splice(rowIndex,1);
            },

            renameForNewFile(filePath){
                if(common.fileExists(filePath)){
                    return this.renameForNewFile(filePath.replace(".","(1)."));
                }
                return filePath;
            },

            goCompress(){
                if(this.fileCompressPercent==100)
                    return;
                if(this.processIng){
                    this.processIng=false;
                    return;
                }
                
                this.$refs['compressOptionsForm'].validate((valid) => {
                    if (valid) {
                        this.processIng=true;
                        this.compressStart();
                    }
                });
            },

            compressStart(){
                for(var i=0;i<this.fileData.length;i++){
                    if(!this.processIng)
                        return;
                    
                    var filterData = this.fileData.filter(item => {
                        return item.status == 1
                    });
                    if(filterData.length==this.processOptions.taskThreadsNumber){
                        return;
                    }

                    if(this.fileData[i].status!=0){
                        continue;
                    }

                    ((j)=>{
                        var outputPath=this.processOptions.outputPath.replace(/\\/g,"/");
                        if(outputPath.length==outputPath.lastIndexOf("/")+1){
                            outputPath=outputPath.substr(0,outputPath.length-1);
                        }
                        var sourcePath = this.fileData[j].sourcePath.replace(/\\/g,"/");
                        outputPath=outputPath+sourcePath.substr(sourcePath.lastIndexOf('/'));
                        outputPath=this.renameForNewFile(outputPath);

                        this.fileData[j].status=1;
                        this.fileData[j].newTmpPath=outputPath;

                        //Compression parameter settings
                        var processOptions={
                            quality:this.processOptions.quality,
                            width:null,
                            height:null
                        };

                        //根据用户设置的分辨率设置图片宽高
                        if(this.processOptions.resolution=='proportionForResolution'){
                            if(Number(this.processOptions.proportionForResolution)!=100){
                                processOptions.width=parseInt(this.fileData[j].sourceWidth*this.processOptions.proportionForResolution/100,10);
                                processOptions.height=parseInt(this.fileData[j].sourceHeight*this.processOptions.proportionForResolution/100,10);
                            }
                        }else{
                            if(this.processOptions.resolution=='customMax'){
                                var imageWidth=this.fileData[j].sourceWidth;
                                var imageHeight=this.fileData[j].sourceHeight;
                                if (this.processOptions.customImageWidth!=null && this.processOptions.customImageWidth!='')
                                    imageWidth=Number(this.processOptions.customImageWidth);
                                if (this.processOptions.customImageHeight!=null && this.processOptions.customImageHeight!='')
                                    imageHeight=Number(this.processOptions.customImageHeight);
                                if(imageWidth!=null && imageHeight==null)
                                    imageHeight=parseInt(this.fileData[j].sourceHeight/this.fileData[j].sourceWidth*imageWidth,10);
                                if(imageWidth==null && imageHeight!=null)
                                    imageWidth=parseInt(this.fileData[j].sourceWidth/this.fileData[j].sourceHeight*imageHeight,10);

                                if(this.fileData[j].sourceWidth > imageWidth || this.fileData[j].sourceHeight > imageHeight){
                                    if (this.fileData[j].sourceWidth/this.fileData[j].sourceHeight > imageWidth/imageHeight){
                                        imageHeight = parseInt(this.fileData[j].sourceHeight / this.fileData[j].sourceWidth * imageWidth, 10);
                                    }else{
                                        imageWidth = parseInt(this.fileData[j].sourceWidth / this.fileData[j].sourceHeight * imageHeight, 10);
                                    }
                                }else{
                                    imageWidth = this.fileData[j].sourceWidth;
                                    imageHeight = this.fileData[j].sourceHeight;
                                }

                                if(imageWidth!=this.fileData[j].sourceWidth || imageHeight!=this.fileData[j].sourceHeight){
                                    processOptions.width=imageWidth;
                                    processOptions.height=imageHeight;
                                }
                            }
                        }

                        imageHelper.compress(this.fileData[j].sourcePath, outputPath, processOptions,()=>{
                            this.fileData[j].status=2;
                            this.fileData[j].newPath=outputPath;
                            this.fileData[j].newTmpPath=null;
                            this.compressStart();
                            this.compressOver();
                            imageHelper.getMetaData(outputPath,(metaData)=>{
                                this.fileData[j].newSize=common.getFileSize(outputPath);
                                this.fileData[j].newWidth=metaData.width;
                                this.fileData[j].newHeight=metaData.height;
                            });
                        },()=>{
                            if(!this.processIng)
                                return;
                            common.deleteFile(this.fileData[j].newTmpPath);
                            this.fileData[j].newTmpPath=null;
                            this.fileData[j].status=3;
                            this.compressStart();
                            this.compressOver();
                        });
                    })(i);
                }
            },

            compressOver(){
                if(this.fileCompressPercent==100){
                    setTimeout(() => {
                        this.$alert(this.$t('imageCompress.compressOver'), this.$t('common.tip'), {
                            confirmButtonText: this.$t('common.ok'),
                            callback: action => {
                                this.processIng=false;
                            }
                        });
                    }, 800);
                }
            },

            openPath(url){
                common.openPath(url);
            }
        }
    }
</script>