import axios from "axios";
import API from "@/api";

/**
 * 获取图片信息
 */
const getImageInfo = async () => {
  const response = await axios.post(API.getImageInfo);
  return response;
};

/**
 * 获取图片块
 */
const getImageChunk = async ({ left, top, width, height }) => {
  const response = await axios.post(
    API.getImageChunk,
    { left, top, width, height },
    { responseType: "arraybuffer" }
  );
  return response;
};

export { getImageInfo, getImageChunk };
