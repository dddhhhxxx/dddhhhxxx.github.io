---
title: RK3568 上的 ISP 和 RGA 分别是干嘛的
date: 2026-10-09
category: 内核与驱动
tags: [RK3568, Rockchip, ISP, RGA, Camera]
---

名字里都带"图像"，但干的活完全不是一回事：**ISP 只吃摄像头进来的 RAW，RGA 吃任何躺在内存里的图像**。前者是相机流水线的固定一环，后者是个想调就调的通用搬运工。

---

## 一句话区分

- **ISP**（Image Signal Processor）：相机专用硬核，位置固定在 VICAP 之后、内存之前，负责把传感器出来的 RAW Bayer 数据"洗"成能看的 YUV/RGB。
- **RGA**（Raster Graphic Acceleration）：独立的 2D 位图加速引擎，不绑摄像头，任何来源的图像都能喂给它做缩放、旋转、格式转换。

## ISP 干什么

RK3568 的 ISP 接的是传感器出来的 RAW Bayer —— 每个像素只有 R/G/B 其中一个分量，人眼没法看。ISP 负责把它处理成正常的图像：

- 基础校正：BLC（黑电平）、LSC（镜头阴影）、坏点、去噪
- Demosaic（Bayer 插值）、白平衡 AWB、色彩矩阵、Gamma、锐化
- HDR 合成、3DLUT
- **3A 统计**：AE/AWB/AF 的统计值由 ISP 硬件算出来吐给用户态

关键一点：**3A 算法不在 ISP 里，在用户态**。RK 的 `rkaiq`（camera_engine / librkaiq）读 ISP 的 stats 节点、算完之后写 params 节点，再通过 I2C 调 sensor。所以"ISP 驱动"和"ISP 效果"是两码事 —— 前者在内核 V4L2 框架下，后者靠 AIQ tuning 的 XML。

## RGA 干什么

RK3568 上是 **RGA2-Enhance（代号 skylarkV2）**，支持：

- 缩放（双线性 / 最近邻）
- 旋转 90/180/270°、水平垂直镜像
- 裁剪、blit 拷贝
- 色彩空间与格式转换：NV12 / NV21 / I420 / RGB565 / ARGB8888 / YUYV 互转
- Alpha 混合、color key、ROP、纯色填充
- NN quantize，专门给 NPU 做前处理

硬件规格上限：

| 项目 | 值 |
| --- | --- |
| 输入分辨率 | 2×2 ~ 8192×8192 |
| 输出分辨率 | 2×2 ~ **4096×4096** |
| 吞吐 | 2 pixel/cycle，300MHz 下约 600 Mpix/s |

1080P 缩放 4ms 级别，比 CPU 软转快一个数量级。

## 数据通路

```
Sensor (RAW Bayer)
   → MIPI CSI-2 / DVP
      → VICAP / CIF
         → ISP  ← 3A 统计与参数在这里进出
            → 内存中的 YUV / NV12
               → RGA（缩放 / 旋转 / 格式转换）
                  → 显示合成 / VPU 编码 / NPU 推理
```

RGA 在这一步之后，跟数据来源无关 —— 它只认内存里的 buffer。

## 代码里会碰到的位置

| | ISP | RGA |
| --- | --- | --- |
| 内核驱动 | `drivers/media/platform/rockchip/isp/` + `cif/` | `drivers/media/platform/rockchip/rga2/` |
| 框架 | V4L2 子设备 + video 节点 | 独立设备节点 |
| 设备节点 | `/dev/videoX`（capture / stats / params） | `/dev/rga` |
| 用户态 | Camera HAL3 + `rkaiq` + `camera3_profiles.xml` | `librga.so` |
| 头文件 | — | `im2d.h`（新）/ `RgaApi.h`（旧）/ `drmrga.h` |

librga 有两套 API：老的 `c_RkRgaBlit()`（填 `rga_info_t`），新的 im2d（`imresize` / `imrotate` / `imcvtcolor` / `improcess()`）。新项目直接用 im2d，它带 `RkRgaQuery` 可以运行时查硬件版本和支持格式，避免硬编码踩坑。

## 几个容易翻车的点

1. **输出别超 4096×4096** —— 输入能到 8192 但输出砍半，超了要分段处理。
2. **缩放倍数有上限**，一次缩放超范围会直接失败，得拆成多级。
3. **不是所有格式组合都能一次搞定** —— 旋转 + 缩放 + 跨色彩空间转换三者叠加，经常要拆两步。
4. **buffer 用 dma-buf fd** —— gralloc / drm 出来的 buffer 传 fd 才是零拷贝，传虚拟地址会有额外拷贝且 IOMMU 容易出问题。
5. **stride / 对齐**：YUV 要求宽高偶对齐，参数不对 ioctl 直接返回 `-EINVAL`。
6. 多进程并发调 `/dev/rga` 时注意同步，单节点共享。

简单记：**ISP 是"生米煮成熟饭"，RGA 是"把饭盛到不同碗里"。**
