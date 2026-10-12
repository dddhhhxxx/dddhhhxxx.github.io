---
title: USB 摄像头还需要 SoC 的 ISP 吗
date: 2026-10-09
category: 平台与外设
tags: [RK3568, USB, UVC, Camera, ISP]
---

不需要，而且物理上也用不了。RK3568 的 ISP 硬核只挂在 VICAP 后面，吃 MIPI CSI-2 / DVP 进来的数据；USB 摄像头的数据从 USB 主机控制器进来，芯片内部根本没有 USB→ISP 的通路。

---

## 为什么用不上

**第一，USB 摄像头自己带 ISP。** UVC 模组里面是 sensor + ISP/DSP 一体封装好的，RAW→YUV、3A、锐化、降噪全在模组里跑完了，吐出来的是成品视频流。UVC 协议里根本没有 RAW Bayer 这一档格式 —— 它只定义 YUYV、NV12、MJPEG、H.264 这些。

**第二，物理上喂不进去。** VICAP 的入口只有 MIPI CSI-2 和 DVP。USB 是另一条总线，数据进 USB 主机控制器后直接 DMA 到内存，中间没有任何通往 ISP 的硬件通路。不是"不想用"，是"没法接"。

判断标准就一句话：**看它输出的是不是 RAW Bayer，不是就不用 SoC 的 ISP。**

现场验证：

```bash
v4l2-ctl -d /dev/video0 --list-formats-ext
```

看到 `YUYV` / `NV12` / `MJPEG` / `H264` → 已处理，ISP 无关。要是看到 `SBGGR` / `SRGGB` 这类 Bayer 格式，那不可能是 USB 摄像头。

## 软件栈整个换掉

| | MIPI RAW sensor | USB 摄像头 |
| --- | --- | --- |
| 内核驱动 | 自己写 sensor subdev + `rkcif` + `rkisp` | 现成的 `uvcvideo` |
| 设备树 | 要配 csi2_dphy、rkisp、IOMMU | 不用配 |
| 3A 调校 | 用户态 `rkaiq` + AIQ tuning XML | 模组内部自己跑，主机通过 UVC 控制项下发 |
| Android | RK CameraHAL3 + `camera3_profiles.xml` | External Camera HAL |

也就是说：不用写 sensor 驱动、不用配 dts、不用碰 rkaiq、不用做 tuning。这是 USB 方案最大的好处，也是画质调不动的根源 —— 效果全看模组厂商的固件，你只能调 `V4L2_CID_EXPOSURE_AUTO`、`V4L2_CID_AUTO_WHITE_BALANCE` 这几个 UVC 参数。

## 但 RGA 还得用

RGA 跟数据来源无关，它只认内存里的 buffer。USB 摄像头出来的 YUYV 要转 RGB 显示、要缩放到 640×640 送 NPU、要旋转 90°，全部还是 RGA 的活。MJPEG 解出来是 NV12，转 RGB 显示同样走 RGA。

## 真正会坑你的几件事

**带宽。** USB2.0 理论 480Mbps，实际有效约 30~40 MB/s。而 YUYV@1080P30 = 1920×1080×2×30 ≈ **124 MB/s**，直接爆掉。要么用 MJPEG / H.264 压缩格式，要么降分辨率帧率，要么插 USB3.0 口。

**MJPEG 要解码。** 帧不能直接送 RGA，得先解：软解（libjpeg / libyuv，1080P 大概几 ms 到十几 ms），或走 MPP / VPU 硬解 JPEG（RK3568 的 JPEG 解码器 7600 万像素/秒，够用）。

**别硬编码 `/dev/videoX`。** USB 设备枚举顺序会变，热插拔一次节点号就漂。用 `/dev/v4l/by-id/` 下的软链接绑定，或者读 `bus_info` 匹配：

```bash
ls -l /dev/v4l/by-id/
```

**延迟比 MIPI 高。** USB 批量传输 + 驱动缓冲队列，通常多 1~3 帧（几十 ms），实时闭环控制场景要算进去。

**多摄像头抢带宽。** 同一 hub 下挂多个会互相拖垮，USB 还是轮询式的，CPU 占用明显高于 MIPI。

**供电和掉设备。** 多路摄像头吃 5V，VBUS 限流没做好会随机掉线，`dmesg` 里表现为反复枚举。

## 一个容易混淆的点

MIPI 也可以不过 RK ISP —— 如果外面接的是自带 ISP 的 bridge 或 sensor（输出 YUV），VICAP 有 YUV 直通路径可以 bypass RK ISP。但那是 MIPI 场景，跟 USB 无关。
