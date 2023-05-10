import { DEFAULT_TRACK_SIZE } from "./data.js";

export default class Track {
  constructor(canvas, opts = {}) {
    this._tracks = [];
    this.canvas = canvas;
    const trackSize = opts.trackSize || DEFAULT_TRACK_SIZE;
    this.tracksNum = Math.floor(this.canvas.height / trackSize) - 1
    this.initTrack();
  }
  
  initTrack() {
    for(let i = 0; i<this.tracksNum; i++) {
      this._tracks[i] = []
    }
  }

  _addToTrack(data) {
    // 单条轨道
    let track;
    // 轨道的最后一项弹幕数据
    let lastItem;
    // 弹幕已经走的路程
    let distance;
    // 弹幕数据最终坐落的轨道索引
    // 有些弹幕会占多条轨道，所以 y 是个数组
    let y = [];

    for (let i = 0; i < this._tracks.length; i++) {
      track = this._tracks[i];
      if (track.length > 0) {
        // 轨道被占用，要计算是否会重叠
        // 只需要跟轨道最后一条弹幕比较即可
        lastItem = track[track.length - 1];

        // 获取已滚动距离
        distance = this.canvas.width - lastItem.x;
        // 通过速度差，计算最后一条弹幕全部消失前，是否会与新增弹幕重叠
        // 如果不会重叠，则可以使用当前轨道
        if (
          distance > lastItem.width &&
          (data.speed <= lastItem.speed ||
            (distance - lastItem.width) / (data.speed - lastItem.speed) >
              (this.canvas.width + lastItem.width - distance) / lastItem.speed)
        ) {
          y.push(i);
        } else {
          y = [];
        }
      } else {
        // 轨道未被占用
        y.push(i);
      }
      // 有足够的轨道可以用时，就可以新增弹幕了，否则等下一次轮询
      if (y.length >= data.useTracks) {
        y.forEach((i) => {
          this._tracks[i].push(data);
        });
        break;
      }
    }

    return y;
  }

  // （弹幕飘到尽头后）从轨道中移除对应数据
  _removeFromTrack(y, id) {
    y.forEach((i) => {
      const track = this._tracks[i];
      for (let j = 0; j < track.length; j++) {
        if (track[j].autoId === id) {
          track.splice(j, 1);
          break;
        }
      }
    });
  }

   // 通过 y 和 id 获取弹幕数据
   _findData(y, id) {
    const track = this._tracks[y];
    for (let j = 0; j < track.length; j++) {
      if (track[j].autoId === id) {
        return track[j];
      }
    }
  }

  // 重置轨道数据
  _resetTracks() {
    this._tracks = new Array(this.tracksNum);
    for (let i = 0; i < this.tracksNum; i++) {
      this._tracks[i] = [];
    }
  }
}
