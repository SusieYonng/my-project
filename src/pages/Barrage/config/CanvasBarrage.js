import Barrage from "./Barrage.js";
import Track from "./Track.js";
import {
  DEFAULT_TRACK_SIZE,
  BarrageDelayedMaxTime,
  BarrageMaxSpeed,
} from "./data.js";
export default class CanvasBarrage {
  constructor(canvas, video, opts = {}) {
    if (!canvas || !video) return;
    this.video = video;
    this.canvas = canvas;
    // 设置canvas的宽高和video一致
    const videoRect = video.getBoundingClientRect();
    this.canvas.width = videoRect.width;
    this.canvas.height = videoRect.height;
    // 获取画布，操作画布
    this.ctx = canvas.getContext("2d");
    // 轨道初始化
    this.track = new Track(this.canvas);
    // 弹幕自增 id
    this.autoId = 0;

    // 设置默认参数，如果没有传就给带上
    let defOpts = {
      color: "#e91e63",
      speed: 1.5,
      opacity: 0.5,
      fontSize: 20,
      data: [],
    };
    // 合并对象并全都挂到this实例上
    Object.assign(this, defOpts, opts);

    // 添加一个属性用来判断播放状态，默认是true暂停
    this.isPaused = true;
    // 得到所有的弹幕消息
    this.barrages = this.data.map((item) => new Barrage(item, this));
    // 渲染canvas绘制的弹幕
    this.render();
    console.log(" ******************** 创建 CanvasBarrage 实例：", this);
  }
  async render() {
    // 清除原来的画布
    this.clear();
    // 渲染弹幕
    this.renderBarrage();
    // 不暂停就一直通过 RAF 渲染动画
    !this.isPaused && requestAnimationFrame(this.render.bind(this));
  }
  clear() {
    // 清除整个画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  renderBarrage() {
    // 首先拿到当前视频播放的时间，要比较弹幕应该展示的时间
    let time = this.video.currentTime;
    // 遍历所有的弹幕，每个barrage都是Barrage的实例
    for (let i = 0; i < this.barrages.length; i++) {
      const barrage = this.barrages[i];
      // 用一个 flag 来标记是否渲染，默认是false
      if (!barrage.flag && time >= barrage.time) {
        // 时效性处理，滞后视频 10s 的弹幕略过
        if (!barrage.isInit && time <= barrage.time + BarrageDelayedMaxTime) {
          barrage.init();
          // 寻找合适轨道
          let trackIndex = (barrage.trackIndex =
            this.track._addToTrack(barrage));
          if (barrage.trackIndex.length > 0) {
            barrage.y =
              (trackIndex[trackIndex.length - 1] + 1) * DEFAULT_TRACK_SIZE;
          }
          barrage.isInit = true;
        }
        // 设置了 y 值的弹幕可以入轨进入画布了
        if (barrage.y) {
          // 弹幕要从右向左渲染，所以x坐标减去当前弹幕的speed即可
          if (time > barrage.time + BarrageDelayedMaxTime) {
            // 时效性处理，在画面上停留 10s 以上的弹幕加至最大速
            barrage.x -= BarrageMaxSpeed;
          } else {
            barrage.x -= barrage.speed;
          }
          barrage.render(); // 渲染当前弹幕
          // 如果当前弹幕的x坐标比自身的宽度还小了，就表示结束渲染了
          if (barrage.x < -barrage.width) {
            barrage.flag = true; // 把flag设为true下次就不再渲染
            this.track._removeFromTrack(barrage.trackIndex, barrage.autoId);
          }
        }
      }
    }
  }
  add(obj) {
    this.barrages.push(new Barrage(obj, this));
  }

  replay() {
    this.clear();
    this.track._resetTracks();
    let time = this.video.currentTime;
    this.barrages.forEach((barrage) => {
      barrage.flag = false;
      if (time < barrage.time) {
        barrage.isInit = false;
      } else {
        barrage.flag = true;
      }
    });
  }
}
