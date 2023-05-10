import { DEFAULT_TRACK_SIZE } from "./data.js";
export default class Barrage {
  constructor(obj, ctx) {
    this.value = obj.value; // 弹幕的内容
    this.time = obj.time; // 弹幕出现时间
    // 把obj和ctx都挂载到this上方便获取
    this.obj = obj;
    this.context = ctx;
    this.autoId = ctx.autoId++;
  }
  // 初始化弹幕
  init() {
    // 如果数据里没有涉及到下面4种参数，就直接取默认参数
    this.color = this.obj.color || this.context.color;
    this.speed = this.obj.speed || this.context.speed;
    this.opacity = this.obj.opacity || this.context.opacity;
    this.fontSize = this.obj.fontSize || this.context.fontSize;
    this.useTracks = Math.ceil(this.fontSize / DEFAULT_TRACK_SIZE);

    const canvasWidth = this.context.canvas.width;
    // const canvasHeight = this.context.canvas.height;
    // 设置弹幕出现的位置
    this.x = canvasWidth;
    this.y = null;
    // 弹幕占用的轨道索引序列
    this.trackIndex = [];

    // // 设置弹幕出现的位置
    // this.y = this.context.canvas.height * Math.random();
    // // 做下超出范围处理
    // if (this.y < this.fontSize) {
    //   this.y = this.fontSize;
    // } else if (this.y > this.context.canvas.height - this.fontSize) {
    //   this.y = this.context.canvas.height - this.fontSize;
    // }
  }
  // 渲染每个弹幕
  render() {
    // 设置画布文字的字号和字体
    this.context.ctx.font = `${this.fontSize}px Arial`;
    // 获取弹幕宽度
    const { width } = this.context.ctx.measureText(this.value);
    this.width = Math.round(width);
    // 设置画布文字颜色
    this.context.ctx.fillStyle = this.color;

    // 绘制文字
    this.context.ctx.fillText(this.value, this.x, this.y);
  }
}
