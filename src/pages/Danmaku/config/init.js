// import "@/style/style.css";

Object.assign =
  Object.assign ||
  function (target) {
    if (target == null) {
      throw new Error("target cannot be null");
    }

    let i = 0,
      key,
      src;
    const len = arguments.length;
    while (++i < len) {
      src = arguments[i];
      if (src != null) {
        for (key in src) {
          if (Object.prototype.hasOwnProperty.call(src, key)) {
            target[key] = src[key];
          }
        }
      }
    }

    return target;
  };

const messages = [
  "来咯来咯",
  "等了两年半，终于来了",
  "你好，我是你的打卡人",
  "打卡人开始浸泡",
  "这个片头不错",
  "不要回答！不要回答！不要回答！",
  "这是智子视角吗？",
  "我是智子，来看看人类的电视剧",
  "物理学不存在了，杨冬的信仰崩塌了",
  "科学的尽头是玄学",
  "比起流浪地球，我更愿称它为中国科幻开门人。",
  "于和伟的史强对味了～！",
  "汪淼形象很贴合原著,为张鲁一打call",
  "汪淼被大史拿捏得妥妥的",
  "众所周知，罗非鱼在三体里属于管制刀具",
  "二分仪关谷分仪",
  "传君来了，哈哈哈",
  "捶过水滴的男人",
  "球状闪电里的丁仪就是这种疯癫的样子",
  "《无间道4:科学边界》",
  "整个人类历史都是一种偶然",
  "人类的历史就是一部不断抵抗黑暗的历史。",
  "时间是宇宙的一条河流，它不断地向前流淌，不停地冲刷着一切。",
  "台词还原度很高，比隔壁乱改强多了",
  "原著粉表示很满意",
  "蚂蚁是黄金配角",
  "毁灭你，与你何干",
  "申玉菲究竟是拯救派还是降临派?",
  "恭迎主帅，叶文洁上线",
  "射手与农场主",
  "刚刚和外星人交流了，他们说这个电视剧拍得太真实了，他们都被吓到了。",
  "可以说几乎是1：1还原三体了",
  "不仅电视剧吊打动画，电视剧里的动画依旧吊打动画",
  "我十分怀疑电视剧让动画先上降低人的心理预期",
  "这是计划的一部分",
  "来了来了，幽灵倒计时",
  "智子就想吓唬吓唬他",
  "整个宇宙将为你闪烁",
  "古筝行动牛逼！！真把钱花在刀刃上了",
  "消灭人类暴政，世界属于三体!",
  "宇宙中最厉害的武器就是物理规律",
  "这个宇宙的真相，不是人脑能承受的！",
  "三体1: 你们是虫子 三体2:你们才是虫子 三体3:我们都是虫子",
];

export default function init(danmaku, container) {
  for (let i = 0; i < 500; i++) {
    danmaku.add({
      msg: messages[parseInt(Math.random() * messages.length)],
      fontSize: Math.floor(Math.random() * 20) + 20,
    });
  }

  let width = container.offsetWidth;
  let height = container.offsetHeight;
  window.addEventListener(
    "resize",
    function () {
      if (
        container.offsetWidth !== width ||
        container.offsetHeight !== height
      ) {
        danmaku.resize();
        width = container.offsetWidth;
        height = container.offsetHeight;
      }
    },
    false
  );
}
