<template>
  <div id="app" :style="{ width: `${width}px`, height: `${height}px` }">
    <div
      v-for="block in visibleBlocks"
      :key="block.id"
      :style="getBlockStyle(block)"
    >
      <img :src="block.src" @load="onBlockLoad(block)" />
    </div>
  </div>
</template>

<script>
import Services from "@/services";

const BLOCK_SIZE = 1000;

export default {
  name: "App",
  data() {
    return {
      width: 0,
      height: 0,
      /**
       * {
       *  id: number,
       *  src: string,
       *  left: number,
       *  top: number,
       *  width: number,
       *  height: number,
       *  status: 'initial' | 'loading' | 'done',
       * }
       */
      blocks: [], // 所有块
      visibleBlocks: [], // 记录视口范围内的块
    };
  },
  async mounted() {
    await this.getImageSize();
    this.createImageBlocks();
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleScroll);
  },
  methods: {
    /**
     * 获取图片信息
     */
    async getImageSize() {
      const response = await Services.getImageSize();
      const { code, data } = response.data;
      if (code === 0) {
        const { width, height } = data;
        this.width = width;
        this.height = height;
      }
    },
    /**
     * 创建图片分块
     */
    createImageBlocks() {
      const rows = Math.ceil(this.height / BLOCK_SIZE);
      const cols = Math.ceil(this.width / BLOCK_SIZE);
      let id = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          this.blocks.push({
            id: id++,
            src: "",
            left: col * BLOCK_SIZE,
            top: row * BLOCK_SIZE,
            width: Math.min(BLOCK_SIZE, this.width - col * BLOCK_SIZE),
            height: Math.min(BLOCK_SIZE, this.height - row * BLOCK_SIZE),
            status: "initial",
          });
        }
      }
    },
    /**
     * 图片块样式
     */
    getBlockStyle(block) {
      return {
        position: "absolute",
        left: block.left + "px",
        top: block.top + "px",
        width: block.width + "px",
        height: block.height + "px",
        overflow: "hidden",
      };
    },
    /**
     * 加载图片块
     */
    async loadImageBlock(block) {
      try {
        block.status = "loading"; // 设置状态为 'loading'，避免重复加载
        const response = await Services.getImageBlock({ ...block });
        const { data, headers } = response;
        const contentType = headers["content-type"];
        const blob = new Blob([data], { type: contentType });
        const url = URL.createObjectURL(blob);
        block.src = url;
        block.status = "done"; // 加载完成后设置状态为 'done'
      } catch (error) {
        console.error("Error loading block image:", error);
        block.status = "initial"; // 加载失败后设置状态为 'initial'，可再次尝试加载
      }
    },
    /**
     * 当块加载完成后，释放对图片资源的占用
     */
    onBlockLoad(block) {
      if (block.status === "done" && !this.visibleBlocks.includes(block)) {
        URL.revokeObjectURL(block.src);
        block.src = "";
        block.status = "initial"; // 设置状态为 'initial'，以便重新加载
      }
    },
    /**
     * 监听视口滚动
     */
    handleScroll() {
      // 获取视口的尺寸和滚动位置
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollLeft = window.scrollX;
      const scrollTop = window.scrollY;

      // 筛选出视口范围内的块
      this.visibleBlocks = this.blocks.filter((block) => {
        const blockTop = block.top;
        const blockBottom = block.top + block.height;
        const blockLeft = block.left;
        const blockRight = block.left + block.width;

        // 判断块是否在视口范围内
        const verticalVisible =
          (blockTop >= scrollTop && blockTop < scrollTop + viewportHeight) ||
          (blockBottom <= scrollTop + viewportHeight &&
            blockBottom > scrollTop);
        const horizontalVisible =
          (blockLeft >= scrollLeft && blockLeft < scrollLeft + viewportWidth) ||
          (blockRight <= scrollLeft + viewportWidth && blockRight > scrollLeft);

        return verticalVisible && horizontalVisible;
      });

      // 加载视口范围内未加载的块的图片
      for (const block of this.visibleBlocks) {
        if (block.status === "initial") {
          this.loadImageBlock(block);
        }
      }

      // 释放不在视口范围内的块的图片资源
      for (const block of this.blocks) {
        if (!this.visibleBlocks.includes(block)) {
          if (block.status === "done" && block.src) {
            URL.revokeObjectURL(block.src);
            block.src = "";
            block.status = "initial"; // 设置状态为 'initial'，以便重新加载
          }
        }
      }
    },
  },
};
</script>

<style lang="scss">
#app {
  position: relative;
}
</style>
