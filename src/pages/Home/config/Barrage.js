export default class Barrage {
  constructor(obj, ctx) {
      this.value = obj.value; // 弹幕的内容
      this.time = obj.time;   // 弹幕出现时间
      // 把obj和ctx都挂载到this上方便获取
      this.obj = obj;
      this.context = ctx;
  }
  // 初始化弹幕
  init() {
      // 如果数据里没有涉及到下面4种参数，就直接取默认参数
      this.color = this.obj.color || this.context.color;
      this.speed = this.obj.speed || this.context.speed;
      this.opacity = this.obj.opacity || this.context.opacity;
      this.fontSize = this.obj.fontSize || this.context.fontSize;
      
      // 为了计算每个弹幕的宽度，我们必须创建一个元素p，然后计算文字的宽度
      let p = document.createElement('p');
      p.style.fontSize = this.fontSize + 'px';
      p.innerHTML = this.value;
      document.body.appendChild(p);
      
      // 把p元素添加到body里了，这样就可以拿到宽度了
      // 设置弹幕的宽度
      this.width = p.clientWidth;
      // 得到了弹幕的宽度后，就把p元素从body中删掉吧
      document.body.removeChild(p);
      
      const canvasWidth = this.context.canvas.width
      const canvasHeight = this.context.canvas.height
      // 设置弹幕出现的位置
      this.x = canvasWidth
      this.y = canvasHeight * Math.random();
      // 做下超出范围处理
      if (this.y < this.fontSize) {
          this.y = this.fontSize;
      } else if (this.y > canvasHeight - this.fontSize) {
          this.y = canvasHeight - this.fontSize;
      }
  }
  // 渲染每个弹幕
  render() {
      // 设置画布文字的字号和字体
      this.context.ctx.font = `${this.fontSize}px Arial`;
      // 设置画布文字颜色
      this.context.ctx.fillStyle = this.color;
      // 绘制文字
      this.context.ctx.fillText(this.value, this.x, this.y);
  }
}