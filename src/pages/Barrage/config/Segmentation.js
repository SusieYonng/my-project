import * as bodySegmentation from "@tensorflow-models/body-segmentation";
import "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import "@mediapipe/selfie_segmentation";
export default class Segmentation {
  constructor({ canvas, video }) {
    this.video = video;
    this.canvas = canvas;
    this.canvasContext = canvas.getContext("2d");

    this.segmenter = null;
    this.maskImageUrl = "";

    // canvas对图片进行缩放
    const { targetWidth, targetHeight } = this.scaledSize(video);
    this.hiddenCanvas = document.createElement("canvas");
    this.hiddenCtx = this.hiddenCanvas.getContext("2d");
    this.scaledWidth = targetWidth;
    this.scaledHeight = targetHeight;

    this.count = 0;
  }
  //模型初始化
  async bodySegmentationInit() {
    try {
      const model =
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
      const segmenterConfig = {
        runtime: "mediapipe",
        modelType: "landscape", // or 'general'
        solutionPath: "/selfie_segmentation", // or "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation"
      };
      this.segmenter = await bodySegmentation.createSegmenter(
        model,
        segmenterConfig
      );
      console.log("模型加载完成");
      return true;
    } catch (error) {
      console.log("模型加载失败-" + error);
      return false;
    }
  }
  //识别
  async recognition(type) {
    if (!this.segmenter) return;
    this.video.width = this.canvas.width;
    this.video.height = this.canvas.height;

    // 截取视频帧，压缩图像尺寸（视频尺寸越大处理的时间就越长）
    const imageData = await this.getResizedImageData({
      image: this.video,
      width: this.scaledWidth,
      height: this.scaledHeight,
    });

    // 传入视频串流、静态图像或 TensorFlow.js 张量来分割人体
    const people = await this.segmenter.segmentPeople(imageData, {
      flipHorizontal: false,
      multiSegmentation: false,
      segmentBodyParts: true,
      segmentationThreshold: 1,
    });

    let mask = null;
    if (type === 1) {
      /* 直接利用上一步执行结果提供的 toCanvasImageSource 方法获取分割人形的位图 */
      mask = await people[0].mask.toCanvasImageSource();
      // mask = await people[0].mask.toImageData()
    } else if (type === 2) {
      /* 使用 toBinaryMask 函数将分割结果转换为 ImageData 对象 */
      mask = await bodySegmentation.toBinaryMask(
        people,
        { r: 0, g: 0, b: 0, a: 0 }, // foregroundColor: 用于可视化属于人的像素的前景色 (r,g,b,a)
        { r: 196, g: 176, b: 255, a: 255 }, //backgroundColor: 用于可视化不属于人的像素的背景颜色 (r,g,b,a)
        false, // drawContour: 是否在每个人的分割蒙版周围绘制轮廓
        0.3 // foregroundThresholdProbability: 将像素着色为前景而不是背景的最小概率
      );
    }
    if (!mask) {
      console.error("mask is null!");
      return;
    } else {
      if (this.count < 6) {
        console.info("currentTime", this.video.currentTime);
        console.info("[mask] >>>", mask);
        this.count++;
      }
    }
    // 展示 mask
    this.displayMask(imageData, mask, type);

    // 将 mask 还原到原尺寸
    const imageBitmap = await this.getResizedBitmap({
      image: mask,
      width: this.canvas.width,
      height: this.canvas.height,
    });
    await this.drawMask(imageBitmap, type);

    return this.maskImageUrl;
  }

  async drawMask(mask, type) {
    const { width, height } = this.video.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    try {
      // 1. 将 mask 绘制到 Canvas 上
      context.drawImage(mask, 0, 0);
      if (type === 1) {
        // 2. 设置混合模式
        context.globalCompositeOperation = "source-out";
        // 3. 反向填充黑色
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      const Base64 = canvas.toDataURL("image/png");
      this.maskImageUrl = Base64;
      this.canvas.style = `-webkit-mask-image: url(${Base64});-webkit-mask-size: ${width}px ${height}px;
      mask-image: url(${Base64});mask-size: ${width}px ${height}px;`;
    } catch (e) {
      console.log("drawMask error ===>", e);
    }
  }

  imgLoad(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        resolve(img);
      };
    });
  }

  /**
   * 将传入的 image 按照目标尺寸转成 imageData 输出
   * image 可以是以下类型：HTMLImageElement、SVGImageElement、HTMLVideoElement、HTMLCanvasElement、ImageBitmap、OffscreenCanvas、VideoFrame、CSSImageValue
   * @param {*} image
   * @returns
   */
  getResizedImageData({ image, width = image.width, height = image.height }) {
    this.hiddenCanvas.width = width;
    this.hiddenCanvas.height = height;
    return new Promise((resolve) => {
      // 清除画布
      this.hiddenCtx.clearRect(0, 0, width, height);
      // 压缩
      this.hiddenCtx.drawImage(image, 0, 0, width, height);

      const imageData = this.hiddenCtx.getImageData(0, 0, width, height);
      resolve(imageData);
    });
  }

  /**
   * 将传入的 image 按照目标尺寸转成 imageBitmap 输出
   * image 可以是以下类型：HTMLImageElement、SVGImageElement、HTMLVideoElement、HTMLCanvasElement、ImageBitmap、OffscreenCanvas、Blob、ImageData
   * @param {*} param0
   * @returns
   */
  async getResizedBitmap({
    image,
    width = image.width,
    height = image.height,
  }) {
    const imageBitmap = await createImageBitmap(
      image,
      0,
      0,
      image.width,
      image.height,
      {
        resizeWidth: width,
        resizeHeight: height,
      }
    );
    return imageBitmap;
  }

  scaledSize(el) {
    // 原始尺寸
    const elRect = el.getBoundingClientRect();
    const originWidth = elRect.width;
    const originHeight = elRect.height;

    // 最大尺寸限制
    const maxWidth = 320;
    const maxHeight = 180;

    // 目标尺寸
    var targetWidth = originWidth,
      targetHeight = originHeight;
    if (originWidth > maxWidth || originHeight > maxHeight) {
      if (originWidth / originHeight > maxWidth / maxHeight) {
        // 更宽，按照宽度限定尺寸
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
      } else {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
      }
    }
    return { targetWidth, targetHeight };
  }

  clearMask() {
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style = `mask-image: unset; -webkit-mask-image: unset; mask-size: 0, 0; -webkit-mask-size: 0, 0;`;
  }

  async displayMask(imageSource, mask, type) {
    const canvas2 = document.getElementById("canvas2");
    if (!canvas2 || !mask) {
      return;
    }
    let imageBitmap2 = mask;
    if (type === 2) {
      // drawImage 方法不接受 imageData 作为，故而转为 ImageBitmap
      imageBitmap2 = await this.getResizedBitmap({
        image: mask,
      });
    }
    const canvas2Context = canvas2.getContext("2d");
    canvas2.width = mask.width;
    canvas2.height = mask.height;
    canvas2Context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    canvas2Context.drawImage(imageBitmap2, 0, 0);
    if (type === 2) {
      const canvas3 = document.getElementById("canvas3");
      if (!canvas3 || !mask || !imageSource) {
        return;
      }
      /* 使用 bodySegmentation 提供的 drawMask 方法渲染到画布上 */
      canvas3.width = imageSource.width;
      canvas3.height = imageSource.height;
      const opacity = 0.5;
      const maskBlurAmount = 3; // Number of pixels to blur by.
      await bodySegmentation.drawMask(
        canvas3,
        imageSource,
        mask, // An ImageData containing the mask. Ideally this should be generated by toBinaryMask or toColoredMask.
        opacity,
        maskBlurAmount
      );
    }
  }
}
