const sharp = require('sharp');

export default {
    //获取图片元数据
    getMetaData:(url,callback)=>{
        sharp(url)
        .metadata()
        .then(function(metadata) {
            //console.log(metadata);
            callback(metadata);
        });
    },

    //压缩
    compress:(input, output, opts,endCallback,errorCallback)=>{
        var sourceFormat=input.substr(input.lastIndexOf('.')+1).toLocaleLowerCase();

        var command;
        if(sourceFormat=='gif'){
            command=sharp(input,{
                animated: true,
                limitInputPixels: false
            })
        }else{
            command=sharp(input);
        }

        //分辨率
        if(opts.width!=null && opts.height!=null){
            command=command.resize({
                width:opts.width,
                height:opts.height
            });
        }

        //执行压缩
        if(sourceFormat=='jpg' || sourceFormat=='jpeg'){
            command=command.jpeg({
                quality: opts.quality, //1-100
                mozjpeg: true //使用 Mozjpeg 默认值
            });
        }else if(sourceFormat=='png'){
            command=command.png({
                quality: opts.quality, //0-100
                //colours: 256 //2-256
            });
        }else if(sourceFormat=='gif'){
            command=command.gif({
                colours: parseInt(opts.quality*256/100,10) //2-256
            });
        }else if(sourceFormat=='webp'){
            command=command.webp({
                quality: opts.quality //1-100
            });
        }else if(sourceFormat=='tif' || sourceFormat=='tiff'){
            command=command.tiff({
                quality: opts.quality //1-100
            });
        }else if(sourceFormat=='avif'){
            command=command.avif({
                quality: opts.quality, //1-100
                lossless: false //使用无损压缩
            });
        }else if(sourceFormat=='heif'){
            command=command.avif({
                quality: opts.quality, //1-100
                lossless: false //使用无损压缩
            });
        }
        command=command.toFile(output)
        .then(data=>{
            //console.log(data);
            if(endCallback!=null){
                endCallback();
            }
        })
        .catch(err=>{
            //console.log(err)
            if(errorCallback!=null){
                errorCallback();
            }
        });
    },

    //格式转换
    formatConvert:(input, output, opts,endCallback,errorCallback)=>{
        var sourceFormat=input.substr(input.lastIndexOf('.')+1).toLocaleLowerCase();
        var newFormat=output.substr(output.lastIndexOf('.')+1).toLocaleLowerCase();
        var command=sharp(input);
        if(newFormat=='jpg' || newFormat=='jpeg'){
            if(sourceFormat=='gif' || sourceFormat=='png'){
                command=command.flatten({ background: '#ffffff' });
            }
            command=command.jpeg();
        }else if(newFormat=='png'){
            command=command.png();
        }else if(newFormat=='gif'){
            command=command.gif();
        }else if(newFormat=='webp'){
            command=command.webp();
        }else if(newFormat=='tif' || newFormat=='tiff'){
            if(sourceFormat=='gif' || sourceFormat=='png'){
                command=command.flatten({ background: '#ffffff' });
            }
            command=command.tiff();
        }else if(newFormat=='avif'){
            command=command.avif();
        }else if(newFormat=='heif'){
            command=command.heif();
        }
        command=command.toFile(output)
        .then(data=>{
            //console.log(data);
            if(endCallback!=null){
                endCallback();
            }
        })
        .catch(err=>{
            //console.log(err)
            if(errorCallback!=null){
                errorCallback();
            }
        });
    },

    //添加水印
    async addWatermark(input, output, opts,endCallback,errorCallback){
        //根据用户设置的分辨率设置图片宽高
        opts.newWidth=opts.sourceWidth;
        opts.newHeight=opts.sourceHeight;
        if(opts.resolution=='proportionForResolution'){
            if(Number(opts.proportionForResolution)!=100){
                opts.newWidth=parseInt(opts.sourceWidth*opts.proportionForResolution/100,10);
                opts.newHeight=parseInt(opts.sourceHeight*opts.proportionForResolution/100,10);
            }
        }else{
            if(opts.resolution=='customMax'){
                var imageWidth=opts.sourceWidth;
                var imageHeight=opts.sourceHeight;
                if (opts.customImageWidth!=null && opts.customImageWidth!='')
                    imageWidth=Number(opts.customImageWidth);
                if (opts.customImageHeight!=null && opts.customImageHeight!='')
                    imageHeight=Number(opts.customImageHeight);
                if(imageWidth!=null && imageHeight==null)
                    imageHeight=parseInt(opts.sourceHeight/opts.sourceWidth*imageWidth,10);
                if(imageWidth==null && imageHeight!=null)
                    imageWidth=parseInt(opts.sourceWidth/opts.sourceHeight*imageHeight,10);

                if(opts.sourceWidth > imageWidth || opts.sourceHeight > imageHeight){
                    if (opts.sourceWidth/opts.sourceHeight > imageWidth/imageHeight){
                        imageHeight = parseInt(opts.sourceHeight / opts.sourceWidth * imageWidth, 10);
                    }else{
                        imageWidth = parseInt(opts.sourceWidth / opts.sourceHeight * imageHeight, 10);
                    }
                }else{
                    imageWidth = opts.sourceWidth;
                    imageHeight = opts.sourceHeight;
                }

                if(imageWidth!=opts.sourceWidth || imageHeight!=opts.sourceHeight){
                    opts.newWidth=imageWidth;
                    opts.newHeight=imageHeight;
                }
            }
        }

        if(opts.watermarkType=='image'){
            var watermarkImgMetaData = await sharp(opts.imagePath).metadata();
            
            if(opts.position=='custom'){
                opts.positionX=Number(opts.positionX);
                opts.positionY=Number(opts.positionY);
            }else if(opts.position=='lt'){
                opts.positionX=10;
                opts.positionY=10;
            }else if(opts.position=='mt'){
                opts.positionX=paretInt((opts.newWidth-watermarkImgMetaData.width)/2,10);
                opts.positionY=10;
            }else if(opts.position=='rt'){
                opts.positionX=opts.newWidth-watermarkImgMetaData.width-10;
                opts.positionY=10;
            }else if(opts.position=='lm'){
                opts.positionX=10;
                opts.positionY=parseInt(opts.newHeight/2-watermarkImgMetaData.height/2,10);
            }else if(opts.position=='m'){
                opts.positionX=paretInt((opts.newWidth-watermarkImgMetaData.width)/2,10);
                opts.positionY=parseInt(opts.newHeight/2-watermarkImgMetaData.height/2,10);
            }else if(opts.position=='rm'){
                opts.positionX=opts.newWidth-watermarkImgMetaData.width-10;
                opts.positionY=parseInt(opts.newHeight/2-watermarkImgMetaData.height/2,10);
            }else if(opts.position=='lb'){
                opts.positionX=10;
                opts.positionY=opts.newHeight-watermarkImgMetaData.height-10;
            }else if(opts.position=='mb'){
                opts.positionX=paretInt((opts.newWidth-watermarkImgMetaData.width)/2,10);
                opts.positionY=opts.newHeight-watermarkImgMetaData.height-10;
            }else if(opts.position=='rb'){
                opts.positionX=opts.newWidth-watermarkImgMetaData.width-10;
                opts.positionY=opts.newHeight-watermarkImgMetaData.height-10;
            }
        }else{
            //dominant-baseline: hanging; 可以改变text y坐标文字起始位置，单sharp未支持，暂时使用dy代替
            var svgText;
            if(opts.position=='custom'){
                svgText=`
                    <text x="${opts.positionX}" y="${opts.positionY}" dy="${opts.fontSize}"
                        style="text-anchor: start;fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }else if(opts.position=='lt'){
                svgText=`
                    <text x="10" y="10" dy="${opts.fontSize}"
                        style="text-anchor: start; fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }else if(opts.position=='mt'){
                svgText=`
                    <text x="50%" y="10" dy="${opts.fontSize}"
                        style="text-anchor: middle; fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }else if(opts.position=='rt'){
                svgText=`
                    <text x="${opts.newWidth-10}" y="10" dy="${opts.fontSize}"
                        style="text-anchor: end; fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }else if(opts.position=='lm'){
                svgText=`
                    <text x="10" y="50%" dy="${parseInt(opts.fontSize/2,10)}"
                        style="text-anchor: start; fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }else if(opts.position=='m'){
                svgText=`
                    <text x="50%" y="50%" dy="${parseInt(opts.fontSize/2,10)}"
                        style="text-anchor: middle; fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }else if(opts.position=='rm'){
                svgText=`
                    <text x="${opts.newWidth-10}" y="50%" dy="${parseInt(opts.fontSize/2,10)}"
                        style="text-anchor: end; fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }else if(opts.position=='lb'){
                svgText=`
                    <text x="10" y="${opts.newHeight-10}" 
                        style="text-anchor: start; fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }else if(opts.position=='mb'){
                svgText=`
                    <text x="50%" y="${opts.newHeight-10}" 
                        style="text-anchor: middle; fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }else if(opts.position=='rb'){
                svgText=`
                    <text x="${opts.newWidth-10}" y="${opts.newHeight-10}" 
                        style="text-anchor: end; fill: ${opts.fontColor!=null?opts.fontColor:'unset'}; font-size: ${opts.fontSize}px; font-weight: bold;fill-opacity:${opts.opacity};">
                        ${opts.text}
                    </text>`;
            }

            const svgImage = `<svg width="${opts.newWidth}" height="${opts.newHeight}">${svgText}</svg>`;
            opts.imagePath = Buffer.from(svgImage);
        }

        var command=sharp(input);

        //修改分辨率
        if(opts.newWidth!=opts.sourceWidth || opts.newHeight!=opts.sourceHeight){
            command=command.resize({
                width:opts.newWidth,
                height:opts.newHeight
            });
        }

        command
        .composite([{
            input: opts.imagePath,
            left: opts.watermarkType=='image'?opts.positionX:0,
            top: opts.watermarkType=='image'?opts.positionY:0
        }])
        .toFile(output)
        .then(data=>{
            console.log(data);
            if(endCallback!=null){
                endCallback();
            }
        })
        .catch(err=>{
            console.log(err)
            if(errorCallback!=null){
                errorCallback();
            }
        });
    }
}