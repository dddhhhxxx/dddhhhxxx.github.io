---
title: Do USB Cameras Need the SoC ISP?
date: 2026-10-09
category: Complex Modules
sub: Camera
tags: [RK3568, USB, UVC, Camera, ISP]
---

No — and physically they can't use it. The ISP hard block on RK3568 sits behind VICAP and only eats data from MIPI CSI-2 / DVP. USB camera data arrives through the USB host controller, and there is simply no USB-to-ISP path inside the chip.

---

## Why it doesn't apply

**First, USB cameras ship with their own ISP.** A UVC module integrates sensor + ISP/DSP in one package. RAW→YUV, 3A, sharpening and denoise all run inside the module; what comes out is a finished video stream. The UVC spec has no RAW Bayer format at all — it only defines YUYV, NV12, MJPEG, H.264 and similar.

**Second, there's no way to feed it.** VICAP's only inputs are MIPI CSI-2 and DVP. USB is a different bus: data enters the host controller and DMAs straight into memory, with no hardware path toward the ISP anywhere in between. It's not "we don't want to" — it's "there's no way to connect it".

The rule of thumb is one sentence: **if it doesn't output RAW Bayer, you don't need the SoC ISP.**

Verify on a live board:

```bash
v4l2-ctl -d /dev/video0 --list-formats-ext
```

See `YUYV` / `NV12` / `MJPEG` / `H264` → already processed, ISP not involved. If you see `SBGGR` / `SRGGB`-style Bayer formats, it can't be a USB camera.

## The whole software stack changes

| | MIPI RAW sensor | USB camera |
| --- | --- | --- |
| Kernel driver | your own sensor subdev + `rkcif` + `rkisp` | off-the-shelf `uvcvideo` |
| Device tree | configure csi2_dphy, rkisp, IOMMU | nothing to configure |
| 3A tuning | userspace `rkaiq` + AIQ tuning XML | runs inside the module; host pushes UVC controls |
| Android | RK CameraHAL3 + `camera3_profiles.xml` | External Camera HAL |

In other words: no sensor driver, no dts, no rkaiq, no tuning. That's the biggest win of USB — and also the root of why you can't tune image quality: everything depends on the module vendor's firmware, and all you get is a handful of UVC controls like `V4L2_CID_EXPOSURE_AUTO` and `V4L2_CID_AUTO_WHITE_BALANCE`.

## But you still need RGA

RGA doesn't care where the data came from; it only sees buffers in memory. Converting YUYV from a USB camera to RGB for display, scaling to 640x640 for the NPU, rotating 90° — all still RGA's job. MJPEG decodes to NV12, and converting that to RGB for display goes through RGA too.

## What will actually bite you

**Bandwidth.** USB2.0 is 480Mbps in theory, roughly 30~40 MB/s in practice. Meanwhile YUYV@1080P30 = 1920x1080x2x30 ≈ **124 MB/s** — blown immediately. Use MJPEG / H.264, drop resolution or framerate, or plug into a USB3.0 port.

**MJPEG needs decoding.** You can't hand frames straight to RGA; decode first — software (libjpeg / libyuv, a few ms to tens of ms at 1080P), or hardware JPEG decode via MPP / VPU (RK3568's JPEG decoder does 76 Mpixel/s, plenty).

**Don't hardcode `/dev/videoX`.** USB enumeration order changes; one replug and the node number drifts. Bind via the symlinks under `/dev/v4l/by-id/`, or match on `bus_info`:

```bash
ls -l /dev/v4l/by-id/
```

**Latency is higher than MIPI.** USB bulk transfers plus driver queueing typically add 1~3 frames (tens of ms). Budget for it in real-time control loops.

**Multiple cameras fight for bandwidth.** Several cameras on one hub drag each other down, USB is polled anyway, and CPU load is noticeably higher than MIPI.

**Power and dropouts.** Multi-camera setups draw 5V; if VBUS current limiting isn't done right they drop randomly, showing up in `dmesg` as repeated re-enumeration.

## One thing that's easy to confuse

MIPI can also skip the RK ISP — if you attach a bridge or sensor with a built-in ISP (outputting YUV), VICAP has a YUV pass-through path that bypasses the RK ISP. But that's a MIPI scenario, unrelated to USB.
