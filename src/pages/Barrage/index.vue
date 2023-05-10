<template>
  <main class="wrap">
    <h1></h1>
    <section class="main">
      <canvas id="canvas"></canvas>
      <video src="@/assets/video/mv_ Anti-Hero.mp4" id="video" controls></video>
    </section>

    <section class="content">
      <input type="text" id="text" />
      <input type="button" value="发弹幕" id="send" />
      <label for="color"> 颜色 </label>
      <input type="color" id="color" value="#f6b73c" />
      <label for="range"> 字号 </label
      ><input type="range" id="range" max="40" min="20" step="4" />
    </section>

    <section class="options" v-show="showOption">
      <div class="wrapper">
        <input type="checkbox" v-model="openMask" id="mask" name="mask" />
        <label for="mask">智能防挡弹幕</label>
      </div>
      <div class="wrapper" v-show="openMask">
        <fieldset>
          <legend>选择通过 segmentPeople 方法分割人形后的处理方式：</legend>
          <input
            type="radio"
            id="mask2"
            name="mask2"
            :value="1"
            v-model="picked"
          />
          <label for="mask2">采用 toCanvasImageSource 方法</label>
          <input
            type="radio"
            id="mask3"
            name="mask3"
            :value="2"
            v-model="picked"
          />
          <label for="mask3">采用 toBinaryMask 方法 </label>
        </fieldset>
      </div>
      <div class="wrapper">
        <p class="desc" v-show="openMask">
          {{
            picked === 1
              ? "利用 toCanvasImageSource() 方法获取的位图绘制如下"
              : "通过 bodySegmentation.toBinaryMask() 方法获取的位图绘制结果如下"
          }}
        </p>
        <canvas id="canvas2" v-show="openMask"></canvas>
        <p class="desc" v-show="openMask && picked === 2">
          进一步采用 bodySegmentation.drawMask() 方法绘制结果如下
        </p>
        <canvas id="canvas3" v-show="openMask && picked === 2"></canvas>
      </div>
    </section>
  </main>
</template>

<script>
import Segmentation from "./config/Segmentation.js";
import CanvasBarrage from "./config/CanvasBarrage.js";
import {
  getRandomInt,
  getRandomArbitrary,
  getRandomIntOfRange,
} from "@/utils/num.js";
import { repeated, data, lyrics } from "./config/data.js";

export default {
  name: "home",
  data() {
    return {
      canvasBarrage: null,
      video: null,
      isPaused: true,
      openMask: false,
      picked: 1,
      segmenter: null,
      timer: null,
      showOption: false,
      retryTimes: 0,
      pageIsHidden: false,
    };
  },
  watch: {
    openMask(val) {
      console.log("openMask:", val);
      if (!val) {
        setTimeout(() => this.removeMask(), 100);
      }
    },
  },
  mounted() {
    const canvas = document.getElementById("canvas");
    const video = document.getElementById("video");
    // 创建CanvasBarrage实例
    this.canvasBarrage = new CanvasBarrage(canvas, video, {
      data: this.initData(),
    });

    const { canvasBarrage } = this;
    // 设置video的play事件来调用CanvasBarrage实例的render方法
    video.addEventListener("play", () => {
      (this.isPaused = false), (canvasBarrage.isPaused = false);
      // 渲染弹幕
      canvasBarrage.render();
    });
    video.addEventListener("pause", () => {
      (this.isPaused = true), (canvasBarrage.isPaused = true);
    });
    // 拖动进度条触发 跳帧 事件
    video.addEventListener("seeked", () => {
      canvasBarrage.replay(); // 重新渲染弹幕
    });
    // 发弹幕
    const btn = document.querySelector("#send");
    btn.addEventListener("click", () => this.onSendText(video));
    const text = document.querySelector("#text");
    text.addEventListener("keyup", (e) => {
      e.keyCode === 13 && this.onSendText(video);
    });

    document.addEventListener(
      'visibilitychange',
      () => {
        this.pageIsHidden = document['hidden'];
      },
      false
    );
    this.segmenter = new Segmentation({ canvas, video });
    this.initSegmenter();
  },
  methods: {
    genarateObj(str) {
      return {
        value: str,
        time: getRandomInt(300),
        color: `hsl(${getRandomInt(360)}, ${getRandomIntOfRange(
          60,
          100
        )}%, ${getRandomIntOfRange(50, 100)}%)`,
        fontSize: getRandomArbitrary(20, 40),
        speed: getRandomArbitrary(1.8, 3),
      };
    },
    initData() {
      let arr = [];
      for (let i = 0; i < 10; i++) {
        arr = arr.concat(repeated.map(this.genarateObj));
      }
      return data.concat(arr).concat(lyrics);
    },
    onSendText(video) {
      const text = document.querySelector("#text");
      const color = document.querySelector("#color");
      const fontSize = document.querySelector("#range");
      const obj = {
        value: text.value,
        color: color.value,
        fontSize: fontSize.value,
        time: video.currentTime,
      };
      text.value = "";
      this.canvasBarrage.add(obj);
    },
    async addMask() {
      if (this.openMask && !this.isPaused && !this.pageIsHidden) {
        // const t0 = window.performance.now();
        await this.segmenter.recognition(this.picked);
        // const t1 = window.performance.now();
        // console.log('segmenter.recognition 函数执行了', (t1 - t0) + "毫秒")
      }
    },
    removeMask() {
      this.segmenter.clearMask();
    },
    async initSegmenter() {
      const res = await this.segmenter.bodySegmentationInit();
      if (res) {
        this.showOption = true;
      } else {
        this.retryTimes < 5 && this.initSegmenter();
        this.retryTimes++;
        return;
      }
      const video = document.getElementById("video");
      res &&
        video.addEventListener("timeupdate", () => {
          this.addMask();
        });
    },
  },
};
</script>
<style scoped lang="scss">
.main {
  height: 480px;
  position: relative;
  margin: 20px auto;
}
#canvas {
  position: absolute;
}
#video {
  width: 853.33px;
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
  input[type="color"] {
    width: 28px;
    height: 24px;
    margin-left: 5px;
  }
}
.options {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin-right: 5px;
  }
  .wrapper {
    margin-top: 10px;
    .desc {
      margin-top: 5px;
      font-size: 14px;
      columns: #666;
    }
  }
}
</style>
