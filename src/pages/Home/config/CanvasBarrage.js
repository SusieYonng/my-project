import Barrage from './Barrage.js'

export default class CanvasBarrage {
  constructor(canvas, video, opts = {}) { 
      // opts = {}表示如果opts没传就设为{}，防止报错，ES6语法
      
      // 如果canvas和video都没传，那就直接return掉
      if (!canvas || !video) return;
      
      // 直接挂载到this上
      this.video = video;
      this.canvas = canvas;
      // 设置canvas的宽高和video一致
      const videoRect = video.getBoundingClientRect()
      this.canvas.width = videoRect.width;
      this.canvas.height = videoRect.height;
      // 获取画布，操作画布
      this.ctx = canvas.getContext('2d');
      
      // 设置默认参数，如果没有传就给带上
      let defOpts = {
          color: '#e91e63',
          speed: 1.5,
          opacity: 0.5,
          fontSize: 20,
          data: []
      };
      // 合并对象并全都挂到this实例上
      Object.assign(this, defOpts, opts);
     
     // 添加一个属性用来判断播放状态，默认是true暂停
     this.isPaused = true;
     // 得到所有的弹幕消息
     this.barrages = this.data.map(item => new Barrage(item, this));
     // 渲染
     this.render();
     console.log(this);
  }
  // 渲染canvas绘制的弹幕
  render() {
    // 渲染的第一步是清除原来的画布，方便复用写成clear方法来调用
    this.clear();
    // 渲染弹幕
    this.renderBarrage(); //
    // 如果没有暂停的话就继续渲染
    if (this.isPaused === false) {
        // 通过raf渲染动画，递归进行渲染
        console.log('current isPaused', this.isPaused);
        requestAnimationFrame(this.render.bind(this));
    }
  }
  clear() {
      // 清除整个画布
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  renderBarrage() {
    // 首先拿到当前视频播放的时间
    // 要根据该时间来和弹幕要展示的时间做比较，来判断是否展示弹幕
    let time = this.video.currentTime;
    
    // 遍历所有的弹幕，每个barrage都是Barrage的实例
    this.barrages.forEach(barrage => {
        // 用一个flag来处理是否渲染，默认是false
        // 并且只有在视频播放时间大于等于当前弹幕的展现时间时才做处理
        if (!barrage.flag && time >= barrage.time) {
            // 判断当前弹幕是否有过初始化了
            // 如果isInit还是false，那就需要先对当前弹幕进行初始化操作
            if (!barrage.isInit) {
                barrage.init();
                barrage.isInit = true;
            }
            // 弹幕要从右向左渲染，所以x坐标减去当前弹幕的speed即可
            barrage.x -= barrage.speed;
            barrage.render(); // 渲染当前弹幕
            
            // 如果当前弹幕的x坐标比自身的宽度还小了，就表示结束渲染了
            if (barrage.x < -barrage.width) {
                barrage.flag = true; // 把flag设为true下次就不再渲染
            }
        }
    });
}
}