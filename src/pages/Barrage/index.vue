<template>
  <div class="wrap">
    <h1></h1>
    <div class="main">
      <canvas id="canvas"></canvas>
      <video src="@/assets/video/mv.mp4" id="video" controls></video>
    </div>

    <div class="content">
      <input type="text" id="text" />
      <input type="button" value="发弹幕" id="btn" />
      <input type="color" id="color" />
      <input type="range" id="range" max="40" min="20" />
    </div>
  </div>
</template>

<script>
import CanvasBarrage from "./config/CanvasBarrage.js";
import { data } from "./config/data.js";

export default {
  name: "home",
  data() {
    return { canvasBarrage: null, video: null };
  },
  mounted() {
    const canvas = document.getElementById("canvas");
    const video = document.getElementById("video");
    // 创建CanvasBarrage实例
    this.canvasBarrage = new CanvasBarrage(canvas, video, { data });
    const { canvasBarrage } = this
    // 设置video的play事件来调用CanvasBarrage实例的render方法
    video.addEventListener("play", () => {
      canvasBarrage.isPaused = false;
      canvasBarrage.render(); // 触发弹幕
    });
    video.addEventListener("pause", () => {
      canvasBarrage.isPaused = true;
    });
    // 拖动进度条触发 跳帧 事件
    video.addEventListener("seeked", () => {
      canvasBarrage.replay() // 重新渲染弹幕
    })
    // 发弹幕
    const btn = document.querySelector("#btn");
    btn.addEventListener("click", () => this.onSendText(video));
    const text = document.querySelector("#text");
    text.addEventListener('keyup', e => {
      e.keyCode === 13 && this.onSendText(video)
    })
  },
  methods: {
    onSendText(video) {
      const text = document.querySelector("#text");
      const color = document.querySelector("#color");
      const fontSize = document.querySelector("#range");
      const obj = {
        value: text.value,
        color: color.value,
        fontSize: fontSize.value,
        time: video.currentTime,
      }
      text.value = ''
      this.canvasBarrage.add(obj)
    },
  },
};
</script>
<style scoped lang="scss">
.main {
  width: 720px;
  height: 480px;
  position: relative;
  margin: 20px auto;
}
#canvas {
  border: 1px solid rebeccapurple;
  position: absolute;
}
#video {
  width: 720px;
  height: 480px;
  background-color: #999;
  border-radius: 10px;
}
.content {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  input {
    margin-right: 18px;
  }
}
</style>
