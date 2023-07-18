import axios from "axios";

const BASE_URL = "http://localhost:3000";
const API = {
  getImageSize: `${BASE_URL}/getImageSize`,
  getImageBlock: `${BASE_URL}/getImageBlock`,
};

/**
 * 获取图片尺寸
 */
const getImageSize = async () => {
  const response = await axios.post(API.getImageSize);
  return response;
};

/**
 * 获取图片块
 */
const getImageBlock = async ({ left, top, width, height }) => {
  const response = await axios.post(
    API.getImageBlock,
    { left, top, width, height },
    { responseType: "arraybuffer" }
  );
  return response;
};

const Services = { getImageSize, getImageBlock };

export default Services;
