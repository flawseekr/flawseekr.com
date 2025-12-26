---
date: 2025-12-20 00:00:00
layout: post
title: Frida Quick Setup (Android)
subtitle: A minimal Frida setup on Linux and Android for pentesting.
description: A quick guide to setting up the Frida client on a Linux host and the Frida server on an Android device, so everything is ready for Mobile Pentesting.
image: /assets/img/uploads/posts/2025/12/2025-12-20-frida-android.png
optimized_image: /assets/img/uploads/posts/2025/12/2025-12-20-frida-android.png
category: android-pentest
tags:
  - tutorial
author: xchopath
---

Because I absolutely hate Static Analysis (a.k.a. reading source code), hooking application functions is my preferred ninja way. That's why in Mobile Pentesting (whether on Android or iOS), Frida is one tool we simply can't avoid.

With hooking techniques, we can manipulate the application's execution flow while it's running. In short, when an _application detects that a device is rooted_, we can "lie" to the app and say, _"Nope, this device is not rooted!"_ by forcing the function to return **False**.

For that reason, if we want to perform effective hooking, Frida is not just helpful, it's absolutely essential.

## Installation

Since Frida uses a client-server architecture, like the Frida Client sends commands from the host machine (PC or laptop) to the Frida Server running on the Android Device. Because of this setup, we need to configure Frida on both sides.

> **Note:** The Android device must be rooted.

### 1. Setup Frida Server (Android)

We can download the Frida Server from the following URL <https://github.com/frida/frida/releases/latest>

When downloading, make sure the file name starts with **frida-server-xxx**, and that the architecture matches the device we are using. To check the device architecture, we can use the following command.

```bash
adb shell getprop ro.product.cpu.abi
```

After identifying the device architecture (for example, arm64), the Frida Server we need to download is **frida-server-xxx-android-arm64.xz**.

**Setup**

Once that's done, extract the file and copy (push) it from the host machine to the Android device using the **adb push** command. After that, enter the device shell using **adb shell**.

```bash
unxz frida-server-17.5.2-android-arm64.xz
```

```bash
adb push frida-server-17.5.2-android-arm64 /data/local/tmp
```

```bash
adb shell
```

![push frida-server to device]({{ "/assets/img/uploads/posts/2025/12/2025-12-20-frida-server-android-push.png" | relative_url }})

After entering the Android shell, we just need to grant execute permission (**+x**) to the **frida-server** file. Next, move the file from **/data/local/tmp** to **/data/local**. However, to perform all of these steps, we need root privileges. That's why we must run the **su** command first.

```bash
su
```

```bash
chmod +x /data/local/tmp/frida-server-17.5.2-android-arm64
```

```bash
mv /data/local/tmp/frida-server-17.5.2-android-arm64 /data/local/
```

Once everything is set, run the frida-server and make sure no errors appear when it starts.

```bash
/data/local/frida-server-17.5.2-android-arm64 -D
```

![run frida-server]({{ "/assets/img/uploads/posts/2025/12/2025-12-20-frida-server-android-run.png" | relative_url }})

### 2. Setup Frida (Linux/PC)

For installing **frida-tools** here (or other Python-based tools), I personally prefer using a virtual environment. This way, I can keep each project's environment isolated and avoid conflicts between libraries during installation.

> **Note:** The Frida tools are **required to use the same version** as the Frida Server.

```bash
python3 -m venv frida
```

```bash
source frida/bin/activate
```

```bash
python3 -m pip install frida-tools frida==17.5.2
```

![install frida-tools]({{ "/assets/img/uploads/posts/2025/12/2025-12-20-frida-tools-installation.png" | relative_url }})

## Verify

Once both sides are installed, we need to make sure everything is working properly by running the following command.

```bash
frida-ps -Uai
```

If the command outputs a list of applications along with their process IDs, it means the installation was successful.

![run frida-ps]({{ "/assets/img/uploads/posts/2025/12/2025-12-20-frida-ps-run.png" | relative_url }})

## Common Errors

**Android Runtime (ART) vs Frida-Server**

Frida Server on Android often doesn't play nicely with ART, so when it runs, various errors can sometimes appear. The first thing I usually do is uninstall ART.

```bash
adb shell
```

```bash
su
```

```bash
pm uninstall com.google.android.art
```

```bash
reboot
```