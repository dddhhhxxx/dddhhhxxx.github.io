---
title: What ISP and RGA Actually Do on RK3568
date: 2026-10-09
category: Complex Modules
sub: Camera
tags: [RK3568, Rockchip, ISP, RGA, Camera]
---

Both have "image" in the name, but they do completely different jobs: **ISP only takes RAW data coming from a camera; RGA takes any image sitting in memory.** The former is a fixed stage of the camera pipeline, the latter is a general-purpose mover you call whenever you need one.

---

## The one-line distinction

- **ISP** (Image Signal Processor): camera-dedicated hardware, fixed between VICAP and memory. Turns RAW Bayer data from the sensor into viewable YUV/RGB.
- **RGA** (Raster Graphic Acceleration): a standalone 2D blitter, not tied to cameras at all. Feed it any image for scaling, rotation, or format conversion.

## What the ISP does

The ISP on RK3568 consumes RAW Bayer from the sensor — each pixel carries only one of R/G/B, which is useless to look at. The ISP processes it into a normal image:

- Basic correction: BLC (black level), LSC (lens shading), bad pixel, denoise
- Demosaic (Bayer interpolation), AWB, color matrix, gamma, sharpening
- HDR merge, 3DLUT
- **3A statistics**: AE/AWB/AF statistics are computed by the ISP hardware and handed to userspace

The key point: **the 3A algorithms are not in the ISP, they run in userspace.** Rockchip's `rkaiq` (camera_engine / librkaiq) reads the ISP stats node, computes, writes the params node, and then drives the sensor over I2C. So "ISP driver" and "ISP image quality" are two different things — the former lives under the kernel V4L2 framework, the latter depends on AIQ tuning XML.

## What the RGA does

RK3568 has **RGA2-Enhance (codename skylarkV2)**, supporting:

- Scaling (bilinear / nearest neighbor)
- Rotation 90/180/270°, horizontal/vertical mirroring
- Crop, blit copy
- Color space and format conversion: NV12 / NV21 / I420 / RGB565 / ARGB8888 / YUYV
- Alpha blending, color key, ROP, solid fill
- NN quantize, for NPU preprocessing

Hardware limits:

| Item | Value |
| --- | --- |
| Input resolution | 2x2 ~ 8192x8192 |
| Output resolution | 2x2 ~ **4096x4096** |
| Throughput | 2 pixel/cycle, ~600 Mpix/s at 300MHz |

1080P scaling lands in the 4ms range — an order of magnitude faster than doing it on the CPU.

## Data path

```
Sensor (RAW Bayer)
   -> MIPI CSI-2 / DVP
      -> VICAP / CIF
         -> ISP  <- 3A stats and params flow in/out here
            -> YUV / NV12 in memory
               -> RGA (scale / rotate / convert)
                  -> display compose / VPU encode / NPU inference
```

RGA sits after this point and does not care where the data came from — it only sees buffers in memory.

## Where you'll meet them in code

| | ISP | RGA |
| --- | --- | --- |
| Kernel driver | `drivers/media/platform/rockchip/isp/` + `cif/` | `drivers/media/platform/rockchip/rga2/` |
| Framework | V4L2 subdev + video nodes | standalone device node |
| Device node | `/dev/videoX` (capture / stats / params) | `/dev/rga` |
| Userspace | Camera HAL3 + `rkaiq` + `camera3_profiles.xml` | `librga.so` |
| Headers | — | `im2d.h` (new) / `RgaApi.h` (old) / `drmrga.h` |

librga has two APIs: the old `c_RkRgaBlit()` (fill a `rga_info_t`), and the newer im2d (`imresize` / `imrotate` / `imcvtcolor` / `improcess()`). Use im2d for new code — it ships `RkRgaQuery` so you can check the hardware version and supported formats at runtime instead of hardcoding them.

## Easy ways to shoot yourself in the foot

1. **Don't exceed 4096x4096 on output** — input goes to 8192 but output is halved; split into tiles if you need more.
2. **Scaling ratio is capped** — a single resize beyond the limit fails outright; chain multiple stages.
3. **Not every format combination works in one pass** — rotation + scaling + cross-color-space conversion together often needs two steps.
4. **Pass dma-buf fds for buffers** — buffers from gralloc / drm should go in as fds for zero-copy; virtual addresses cost an extra copy and tend to upset the IOMMU.
5. **stride / alignment**: YUV requires even width and height; wrong parameters and the ioctl simply returns `-EINVAL`.
6. Watch synchronization when multiple processes call `/dev/rga` concurrently — it's a single shared node.

Short version: **the ISP cooks the rice; the RGA serves it into different bowls.**
