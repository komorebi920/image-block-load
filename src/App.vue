<template>
  <div id="app" :style="{ width: `${width}px`, height: `${height}px` }">
    <div v-for="block in blocks" :key="block.id" :style="getBlockStyle(block)">
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
       * }
       */
      blocks: [],
    };
  },
  async mounted() {
    await this.getImageSize();
    this.createImageBlocks();
    await this.onImageLoad();
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
      const response = await Services.getImageBlock({ ...block });
      const { data, headers } = response;
      if (data.byteLength > 0) {
        const contentType = headers["content-type"];
        const blob = new Blob([data], { type: contentType });
        const url = URL.createObjectURL(blob);
        block.src = url;
      }
    },
    /**
     * 当块加载完成后，释放对图片资源的占用
     */
    onBlockLoad(block) {
      URL.revokeObjectURL(block.src);
    },
    /**
     * 图片整体加载完成后，依次加载每个块的图片
     */
    async onImageLoad() {
      for (const block of this.blocks) {
        await this.loadImageBlock(block);
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
