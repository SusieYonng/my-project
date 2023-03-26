<template>
  <div class="outer">
    <div id="container" class="container"></div>
  </div>
</template>
<script>
import init from "./config/init.js";
import Danmaku from "./config/basic.js";
// import Danmaku from "./config/opt1_skip.js";
// import Danmaku from "./config/opt2_distance.js";
// import Danmaku from "./config/opt3_pause.js";
// import Danmaku from "./config/opt4_discard.js";
// import Danmaku from "./config/opt5_recycle.js";

export default {
  name: "danmaku-demo",
  mounted() {
    const container = document.getElementById("container");

    const danmaku = new Danmaku({
      container,
    //   allowDiscard: true,
    });

    init(danmaku, container);
  },
};
</script>
<style scoped src="./basic.css"></style>
