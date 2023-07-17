const Koa = require("koa");
const koaRouter = require("koa-router");
const koaStatic = require("koa-static");
const { koaBody } = require("koa-body");
const koaCors = require("koa2-cors");
const sharp = require("sharp");
const fs = require("fs");
const mine = require("mime");

const app = new Koa();
const router = new koaRouter();

// 使用 koa2-cors 中间件来处理跨域请求
app.use(koaCors());

// 指定了静态文件的根目录
app.use(koaStatic(`${__dirname}/public`));

// 使用 koa-body 中间件来处理文件上传
app.use(koaBody());

// 获取图片信息
router.post("/getImageInfo", async (ctx) => {
  try {
    const imagePath = `${__dirname}/public/neom-qGH25zv5xMk-unsplash.jpg`;
    const imageBuffer = fs.readFileSync(imagePath);
    const imageInfo = await sharp(imageBuffer).metadata(); // 使用 sharp 获取图片尺寸
    const { size, width, height } = imageInfo;
    ctx.body = { code: 0, message: "成功", data: { size, width, height } };
  } catch (error) {
    console.error("读取图片失败:", error);
    ctx.status = 500; // 服务器错误
    ctx.body = { code: 1, message: "读取图片失败" };
  }
});

// 获取图片块
router.post("/getImageChunk", async (ctx) => {
  try {
    const { left, top, width, height } = ctx.request.body;
    const imagePath = `${__dirname}/public/neom-qGH25zv5xMk-unsplash.jpg`;
    const imageBuffer = fs.readFileSync(imagePath);
    const imageContentType = mine.getType(imagePath);
    const imageChunk = await sharp(imageBuffer)
      .extract({ left, top, width, height })
      .toBuffer();
    ctx.type = imageContentType;
    ctx.response.body = imageChunk;
  } catch (error) {
    console.error("提取图片失败:", error);
    ctx.status = 500; // 服务器错误
    ctx.body = { code: 1, message: "提取图片失败" };
  }
});

// 将路由注册到应用
app.use(router.routes()).use(router.allowedMethods());

// 启动服务器
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
