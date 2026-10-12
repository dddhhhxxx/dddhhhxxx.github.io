---
title: About
description: About this blog and its author
---

# About

Embedded low-level software engineer based in Hangzhou, working across the stack from bare-metal MCU and RTOS up to Linux kernel drivers and Android BSP, mostly on Rockchip and Allwinner SoCs.

This blog exists for two things:

1. **Problems debugged in the field** — kernel panics, device tree mistakes, dead peripherals, boot hangs. Writing down the symptom, the process of locating it, and the conclusion, so the same trap isn't stepped in twice.
2. **Notes on how things work underneath** — data paths, driver frameworks, how hardware blocks relate to each other, written as something to look back at.

Posts are organized along four axes: **Software Delivery** (MCU / RTOS / Linux / Android), **Hardware & Peripherals** (SoC / MCU), **Complex Modules** (Camera / Display), and **Performance & Power**.

## Writing principles

- Lead with the conclusion, paste commands that actually run, skip the filler
- Where registers, device trees or logs are involved, give concrete paths and values
- Mark uncertainty explicitly rather than dressing up "probably" as "definitely"

## Site stack

- [VitePress](https://vitepress.dev/) — static site generator
- GitHub Pages — hosting
- Markdown — writing

Source repository via the GitHub link in the nav bar.

## Contact

For technical discussion or to point out an error, issues and PRs are welcome.
