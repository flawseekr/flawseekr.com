---
date: 2025-11-10 00:00:00
layout: post
title: Brute Forcing Web Logins Using FFuF
subtitle: A Faster, Lighter Way to Crack Web Logins.
description: FFuF offers a lightweight and fast alternative to heavy Burp Suite (Intruder) for cracking web logins.
image: /assets/img/uploads/posts/2025/11/2025-11-10-ffuf-goes-brrr.png
optimized_image: /assets/img/uploads/posts/2025/11/2025-11-10-ffuf-goes-brrr.png
category: web-pentest
tags:
  - tutorial
author: xchopath
---

I once did something really stupid. During a cybersecurity certification exam, I tried to brute-force a web login page using Burp Suite's Intruder.

**What made it stupid?**

> I used `rockyou.txt` as the wordlist.

Combining Burp Suite (Java-based) with a **rockyou.txt** wordlist containing tens of millions of entries caused my laptop to shut down instantly.

**Workaround**

In the middle of that chaos, my colleague (@yuyudhn) suggested using FFuF as an alternative.

To be honest, I was already familiar with FFuF, but I had _only ever used it for directory enumeration_. I didn't realize that it could be **customized into a brute-force tool** (like Hydra).

## Tutorial

![sample http login]({{ "/assets/img/uploads/posts/2025/11/2025-11-10-sample-http-login-page.png" | relative_url }})

As an example, I've prepared a simple application to demonstrate this in the article.

The next step is to capture the complete login request, including the HTTP headers, parameters, and the error response. To capture all of this, I (still) use Burp Suite.

**Note** the key things we need are:
- The full HTTP request (headers and parameters)
- The **error message returned** when a login attempt fails (this will be used as a filter in FFuF)

![capture the request]({{ "/assets/img/uploads/posts/2025/11/2025-11-10-capture-the-request-with-burp.png" | relative_url }})

Since our enumeration target is the password parameter, we can simply replace its value with `%PASS%`. After that, save the request into a file (for example: **request.txt**).

![capture the request 2]({{ "/assets/img/uploads/posts/2025/11/2025-11-10-request.txt.png" | relative_url }})

Once everything is ready, we can simply run FFuF using the command below.

```sh
ffuf -u http://example.com/login -request request.txt -w /usr/share/wordlists/rockyou.txt:%PASS% -fr '(error message)' -t 100 -r -v
```

![ffuf run]({{ "/assets/img/uploads/posts/2025/11/2025-11-10-ffuf-run.png" | relative_url }})

**The key points to understand**:
- The `-w` parameter is used to load the wordlist, and each password entry will be injected via the `%PASS%` variable (referenced in **request.txt**).
- The `-fr` parameter is a **regex filter** used to filter out responses that contain error messages. As long as FFuF still detects those keywords, it will treat the login attempt as unsuccessful.