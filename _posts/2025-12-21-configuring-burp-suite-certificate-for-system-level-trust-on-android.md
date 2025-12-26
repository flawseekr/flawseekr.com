---
date: 2025-12-21 00:00:00
layout: post
title: Burp Suite Certificate Setup for Android 13 and Below
subtitle: Step-by-Step Guide to Enabling SSL Interception on Android 13 and earlier.
description: In this guide, we'll walk you through the process of configuring the Burp Suite certificate for system-level trust on Android 13 and earlier.
image: /assets/img/uploads/posts/2025/12/2025-12-21-configuring-burp-suite-certificate-for-system-level-trust-on-android.png
optimized_image: /assets/img/uploads/posts/2025/12/2025-12-21-configuring-burp-suite-certificate-for-system-level-trust-on-android.png
category: android-pentest
tags:
  - tutorial
author: xchopath
---

If Android doesn't have the Burp Suite certificate installed at the system level, all HTTPS traffic will be outright blocked. Think of it like Android refusing to communicate with Burp Suite until it's given an official "ID badge." That's exactly what this certificate does.

And of course, this is one of the mandatory prerequisites we need to set up before getting into Android application pentesting.

Alright, enough talking, let's get started.

To follow along and simply copy-paste the commands, make sure you have:
- Your Android version is 13 or lower
- An Android device connected via ADB
- Burp Suite up and running

## Prep the Certificate

![http://burp via browser]({{ "/assets/img/uploads/posts/2025/12/2025-12-21-http-burp-via-browser.png" | relative_url }})

First, we need to make sure that Burp Suite is running and accessible through the browser.

Once that's set up, we need to download the certificate directly via the Burp Suite proxy to get the certificate file in DER format. After that, we'll convert it to PEM format for compatibility. And then, we'll rename the certificate file based on its subject hash so it can be properly recognized once it's installed on an Android system.

```bash
curl -s --proxy "http://127.0.0.1:8080" "http://burp/cert" -o burpsuite.der
```

```bash
openssl x509 -inform DER -in burpsuite.der -out burpsuite.pem
```

```bash
cp burpsuite.pem $(openssl x509 -inform PEM -subject_hash_old -in burpsuite.pem | head -1).0
```

![prep the certificate]({{ "/assets/img/uploads/posts/2025/12/2025-12-21-prep-the-certificate.png" | relative_url }})

## Configure

Once the Burp Suite certificate has been prepared and converted, the next step is to push it into a writable directory on the Android device.

```bash
adb push 9a5ba575.0 /sdcard/
```

```bash
adb shell
```

![push the certificate]({{ "/assets/img/uploads/posts/2025/12/2025-12-21-adb-push-cert.png" | relative_url }})

### Configure (Normal Step)

Next, we move the certificate into the system certificates directory. Because / (root) is immutable by default, it must be remounted as writable before we can proceed.

```bash
su
```

```bash
mount -o rw,remount /
```

```bash
mv /sdcard/9a5ba575.0 /system/etc/security/cacerts/
```

![remount to read and write then move the cert]({{ "/assets/img/uploads/posts/2025/12/2025-12-21-remount-and-move.png" | relative_url }})

After that, we adjust the certificate file's permissions and ownership to ensure compatibility with the Android system. After that, we remount the root (/) filesystem back to read-only and reboot the device.

```bash
chmod 644 /system/etc/security/cacerts/9a5ba575.0
```

```bash
chown root:root /system/etc/security/cacerts/9a5ba575.0
```

```bash
mount -o ro,remount /
```

```bash
reboot
```

![adjust cert permission and owner then remount to read-only]({{ "/assets/img/uploads/posts/2025/12/2025-12-21-adjust-cert-permission-and-owner.png" | relative_url }})

## Verify

With these steps completed, the Burp Suite certificate is now installed as a system certificate, allowing the Android device to trust intercepted HTTPS traffic during testing. But, this _does not bypass SSL Pinning_ if it is enforced by the application.

For verification, simply check the Android device. If the PortSwigger certificate is listed under system certificates, the setup has been completed successfully.

![PortSwigger Lab Certificate]({{ "/assets/img/uploads/posts/2025/12/2025-12-21-portswigger-certificate.png" | relative_url }})