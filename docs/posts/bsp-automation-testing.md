---
title: RK3568 + Android 12 BSP 自动化测试方案
date: 2026-10-10
category: 工程与测试
tags: [RK3568, Android, BSP, 自动化测试, pytest, CI]
---

核心主张：**别一上来搞"大而全的测试平台"，先做「Host 驱动 + 板端执行」的分层体系，把 80% 精力砸在驱动功能层上。** CTS/VTS 是 Google 的通用合规套件，覆盖不到自研的驱动和外设 —— 那部分必须自己写。

---

## 整体架构：Host 驱动 + 板端执行

- **主机**：Python + pytest，负责用例编排、超时、重试、日志采集、断言、报告
- **板端**：只放"最小执行单元"—— 一个自研测试二进制或几条 shell 命令，负责执行硬件操作并打印可解析的结果
- **治具**：串口抓 log、继电器控电源、USB hub 扩多机

理由很简单：板端资源有限、Android 上没有 Python、测试逻辑放主机好维护，而治具只能在主机侧控制。

板端输出结构化结果，判定逻辑全在主机：

```bash
RESULT gpio_name=backlight
RESULT gpio_value=1
RESULT i2c_addr=0x2c
RESULT i2c_readback=0x5a
RESULT verdict=PASS
```

好处是改判定条件不用重新编译板端程序，也方便复用到不同板卡版本。

## 六层分层

| 层 | 内容 | 位置 |
| --- | --- | --- |
| L5 | 稳定性与压力：reboot × N、monkey、掉电、长跑 | 治具 + CI |
| L4 | 系统集成：CTS/VTS、休眠唤醒、OTA 升级 | 板端 |
| L3 | HAL 与接口：自研 HAL、HIDL/AIDL 调用 | 板端 / atest |
| **L2** | **驱动功能：sysfs/ioctl、外设读写、回环 —— 自研主战场** | Host + 板端 |
| L1 | 内核单元：KUnit、自写测试模块 | 内核态 |
| L0 | 静态检查：编译、checkpatch、dtb 差异 | 构建机 |

### L0 性价比最高

RK 平台上最常翻车的其实是"配置被改坏"：

```bash
# 防别人偷偷开关内核选项
scripts/diffconfig .config arch/arm64/configs/rockchip_defconfig

# 防 DTS 误改：反编译后比对
dtc -I dtb -O dts rk3568.dtb > /tmp/a.dts
diff /tmp/a.dts /tmp/b.dts
```

`checkpatch.pl` + 编译 warning 清零，一起做进 pre-commit 和 CI 门禁。

### L2 按外设逐个建用例

| 外设 | 手段 | 判定 |
| --- | --- | --- |
| GPIO | `gpiod` / sysfs 写值回读 | 状态一致 |
| I2C | `i2cdetect` 扫地址、`i2cset/i2cget` 回读 | 地址存在 + 回读相等 |
| SPI | `spidev_test`（MOSI 短接 MISO） | 收发字节一致 |
| UART | TX/RX 短接自发自收 | 误码率 0 |
| RTC | `hwclock` 写 → 掉电 → 读 | 时间保持 |
| Watchdog | 停喂狗 | 预期内复位 |
| 显示 | `modetest` 枚举 + 截图 md5 | 模式正确、画面非黑 |
| Touch/按键 | `getevent` 抓 input 事件 | 事件码匹配 |
| 摄像头 | `v4l2-ctl` 抓 N 帧 | 尺寸格式正确、帧非空 |

### L5 才是抓隐藏 bug 的地方

reboot 1000 次、随机掉电、外设 24h 长跑。驱动里那些偶发的 probe 竞态、时钟没关、电源域顺序问题，全在这层现原形。

## 关键基础设施

**串口必须接，波特率是 1500000。** 这是 RK 平台的坑 —— 不是 115200。主机用 `pyserial` 全程录 log，作用有三个：抓 kernel panic / Oops / BUG、U-Boot 阶段失败时定位、dmesg 被冲掉后还能回溯早期信息。没有串口，失败用例基本只能靠猜。

**可控继电器 / 可编程电源。** 用于掉电测试，以及板子卡死时自动断电恢复。USB 继电器几块钱就能搞定。

**自动刷机。** fastboot 为主 + `rkdeveloptool` / `upgrade_tool` 做 MaskROM 救砖。做成"刷机 → 校验版本 → 跑用例"一条龙。

**报告格式。** pytest 直出 JUnit XML，Jenkins / GitLab CI 直接吃。

## 落地分四期

| 期 | 周期 | 交付 |
| --- | --- | --- |
| 一期 | 1~2 周 | 刷机脚本 + 10~20 条关键外设冒烟用例 + 串口 log 采集 |
| 二期 | 2~4 周 | 补齐外设回归集 + reboot 压力 + 掉电测试 + 接 CI 每日构建 |
| 三期 | 3~4 周 | HAL 单测 + 接口测试 + 报告看板 + 多机并行 |
| 四期 | 可选 | KUnit、覆盖率、故障注入 |

**一期最重要**。先让"刷机 → 跑用例 → 出报告"这条链路跑通，哪怕只有 10 条用例，团队已经开始受益。反过来，一上来设计完美框架、三个月没跑通一条用例，是这类项目最常见的死法。

## 几条硬规矩

- 每条用例必须有超时（adb 命令挂住是常态），用 `pytest-timeout`
- 用例要幂等，失败后能自动 reboot 恢复再重试一次
- **严格区分"环境失败"和"产品缺陷"** —— 板子没起来、串口断了算 infra error，不算用例失败
- 报告里必须带 **内核版本 + dtb md5 + build fingerprint**，不然三个月后回溯不了是哪版固件的问题
- 硬件差异（GPIO 号、I2C 地址、设备节点路径）全部抽到 config 文件

## 关于 L1 内核单元测试

优先级放最低。KUnit 是 Linux 5.5 才进主线的，RK3568 Android 12 SDK 如果是 4.19 内核就用不了（得 backport 或自己写测试模块）。而且 BSP 驱动大多跟硬件强耦合，能脱离硬件单测的部分很少，投入产出比不如直接做 L2。
