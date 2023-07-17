<template>
  <img :src="url" ref="img" />
</template>

<script>
import { getImageInfo, getImageChunk } from "@/services";

export default {
  name: "App",
  data() {
    return {
      url: "",
    };
  },
  mounted() {
    getImageInfo()
      .then(() =>
        getImageChunk({
          left: 100,
          top: 100,
          width: 100,
          height: 100,
        })
      )
      .then((response) => {
        const contentType = response.headers["content-type"];
        const arraybuffer = response.data;
        const blob = new Blob([arraybuffer], { type: contentType });
        const url = URL.createObjectURL(blob);
        this.url = url;
        this.$refs.img.onload = () => {
          URL.revokeObjectURL(url);
        };
      });
  },
};
</script>

<style lang="scss"></style>
