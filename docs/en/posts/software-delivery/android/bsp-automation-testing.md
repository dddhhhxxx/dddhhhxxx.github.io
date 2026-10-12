---
title: Automated BSP Testing on RK3568 + Android 12
date: 2026-10-10
category: Software Delivery
sub: Android
tags: [RK3568, Android, BSP, Testing, pytest, CI]
---

The core argument: **don't start by building a "complete test platform". Build a layered "host-driven, board-executes" system first, and put 80% of the effort into the driver functionality layer.** CTS/VTS are Google's generic compliance suites — they don't cover your own drivers and peripherals. That part you have to write yourself.

---

## Overall architecture: host drives, board executes

- **Host**: Python + pytest — case orchestration, timeouts, retries, log capture, assertions, reports
- **Board**: only a "minimal execution unit" — an in-house test binary or a few shell commands that perform hardware operations and print parseable results
- **Fixtures**: serial port for logs, relay for power control, USB hub for multiple boards

The reasoning is simple: board resources are limited, Android has no Python, test logic is easier to maintain on the host, and fixtures can only be controlled from the host side anyway.

The board prints structured results; all verdict logic lives on the host:

```bash
RESULT gpio_name=backlight
RESULT gpio_value=1
RESULT i2c_addr=0x2c
RESULT i2c_readback=0x5a
RESULT verdict=PASS
```

The benefit: changing a pass condition doesn't mean recompiling the board binary, and it's easy to reuse across board revisions.

## Six layers

| Layer | Content | Where |
| --- | --- | --- |
| L5 | Stability and stress: reboot x N, monkey, power cut, long runs | Fixture + CI |
| L4 | System integration: CTS/VTS, suspend-resume, OTA | Board |
| L3 | HAL and interfaces: in-house HAL, HIDL/AIDL calls | Board / atest |
| **L2** | **Driver functionality: sysfs/ioctl, peripheral r/w, loopback — the main in-house battlefield** | Host + board |
| L1 | Kernel unit tests: KUnit, custom test modules | Kernel |
| L0 | Static checks: build, checkpatch, dtb diff | Build machine |

### L0 has the best cost/benefit ratio

On Rockchip platforms, the most common failure is actually "someone broke the config":

```bash
# catch someone silently toggling kernel options
scripts/diffconfig .config arch/arm64/configs/rockchip_defconfig

# catch DTS mistakes: decompile and diff
dtc -I dtb -O dts rk3568.dtb > /tmp/a.dts
diff /tmp/a.dts /tmp/b.dts
```

Wire `checkpatch.pl` and a zero-compile-warning gate into pre-commit and CI.

### L2: build cases per peripheral

| Peripheral | Method | Pass condition |
| --- | --- | --- |
| GPIO | `gpiod` / sysfs write then read back | state matches |
| I2C | `i2cdetect` scan, `i2cset/i2cget` readback | address present + readback equal |
| SPI | `spidev_test` (MOSI shorted to MISO) | TX/RX bytes identical |
| UART | TX/RX shorted, self transmit/receive | zero bit errors |
| RTC | `hwclock` write -> power off -> read | time retained |
| Watchdog | stop petting the dog | resets as expected |
| Display | `modetest` enumerate + screenshot md5 | correct mode, non-black frame |
| Touch/keys | `getevent` capture input events | event codes match |
| Camera | `v4l2-ctl` capture N frames | correct size/format, frames non-empty |

### L5 is where hidden bugs surface

1000 reboots, random power cuts, 24h peripheral soak. Sporadic probe races, clocks left enabled, power-domain ordering issues — they all show up here.

## Critical infrastructure

**Wire up the serial port, and the baud rate is 1500000.** That's the Rockchip gotcha — not 115200. Record the whole session with `pyserial` on the host, for three reasons: catching kernel panic / Oops / BUG, locating failures during the U-Boot stage, and recovering early logs after dmesg has wrapped. Without serial, a failing case is mostly guesswork.

**Controllable relay / programmable power supply.** For power-cut tests, and for auto power-cycling a hung board. A USB relay costs a couple of dollars.

**Automated flashing.** fastboot as primary, with `rkdeveloptool` / `upgrade_tool` for MaskROM recovery. Make it one pipeline: flash -> verify version -> run cases.

**Report format.** pytest emits JUnit XML directly, which Jenkins / GitLab CI consume as-is.

## Roll out in four phases

| Phase | Duration | Deliverable |
| --- | --- | --- |
| 1 | 1~2 weeks | flashing script + 10~20 key peripheral smoke cases + serial log capture |
| 2 | 2~4 weeks | full peripheral regression set + reboot stress + power-cut tests + daily CI build |
| 3 | 3~4 weeks | HAL unit tests + interface tests + report dashboard + parallel boards |
| 4 | optional | KUnit, coverage, fault injection |

**Phase 1 matters most.** Get the "flash -> run cases -> produce report" loop working first — even with only 10 cases the team starts benefiting. The opposite, designing a perfect framework and not running a single case for three months, is how these projects usually die.

## A few hard rules

- Every case needs a timeout (adb commands hanging is normal) — use `pytest-timeout`
- Cases must be idempotent; on failure, auto-reboot and retry once before giving up
- **Separate "environment failure" from "product defect" strictly** — board didn't boot or serial dropped is an infra error, not a failed case
- Reports must carry **kernel version + dtb md5 + build fingerprint**, otherwise three months later you can't trace which firmware the result came from
- Hardware differences (GPIO numbers, I2C addresses, device node paths) all go into a config file

## On L1 kernel unit tests

Lowest priority. KUnit only entered mainline at Linux 5.5, so if your RK3568 Android 12 SDK is on a 4.19 kernel you can't use it (you'd have to backport or write your own test module). On top of that, BSP drivers are tightly coupled to hardware — little of them can be unit tested off-target, and the return is worse than just doing L2 properly.
