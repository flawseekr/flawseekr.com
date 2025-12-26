---
date: 2025-12-22 00:00:00
layout: post
title: A $3,500-Worth HTML Injection by Abusing CSRF-like
subtitle: Chaining a Low-Severity HTML Injection with Same-Site Request Forgery to Escalate Impact.
description: This article explains how an HTML injection vulnerability can be abused to bypass the usual limitations of CSRF, allowing attackers to execute sensitive actions.
image: /assets/img/uploads/posts/2025/12/2025-12-22-chaining-html-injection-to-account-takeover-by-abusing-self-csrf.png
optimized_image: /assets/img/uploads/posts/2025/12/2025-12-22-chaining-html-injection-to-account-takeover-by-abusing-self-csrf.png
category: web-pentest
tags:
  - bugbounty
author: xchopath
---

In mid Q3 of 2025, my partner ([@fariqfgi](https://fariq.me/about)) and I decided to jump back into bug bounty after a long hiatus. Unfortunately, things didn't go as planned, two full weeks went by with nothing but frustration and zero findings.

In the middle of that chaos, my partner **discovered an HTML Injection issue**. However, he **wasn't confident enough to report it** (worried it would end up being marked as Not Applicable).

That's when I spent the next two days thinking hard: "**Is there a way to actually get paid from a seemingly low-impact bug like this?**."

## Lack of Token-based CSRF Protection

After giving it some serious thought, I started closely **observing the application's behavior**. That's when I noticed that **there was no token-based CSRF protection** in place.

I quickly realized something important.

> Relying on the `SameSite` attribute does not fully mitigate **Request Forgery** vulnerabilities.

**Why?**

The **SameSite** attribute primarily works by restricting **cookies** from being sent along with cross-site requests.

![cross-site blocked]({{ "/assets/img/uploads/posts/2025/12/2025-12-22-cross-site-blocked.png" | relative_url }})

But things get interesting when the attack scenario shifts like this.

![same-site accepted]({{ "/assets/img/uploads/posts/2025/12/2025-12-22-same-site-accepted.png" | relative_url }})

I know this is a bit of an edge case. But, with **no token-based CSRF protection**, an **HTML Injection** vulnerability makes it highly possible to **perform sensitive actions**.

## Form Injection to Request Forgery

Alright, now let's talk about how we crafted the payload.

First, we looked for **a feature or endpoint with the highest potential impact** (such as **deleting** data or **updating** data).

> In our case, since **the target application had a feature for adding new users to the organization**, we abused this functionality to achieve **Account Takeover** by creating a new user.

So, the payload we crafted roughly followed this structure:
- Create an HTML `<form>`
- Target a "sensitive action" endpoint
- Make sure the payload is accessible by other users

**Sample HTML Injection Payload**

```html
<form action="/manage/users" method="POST">
<input type="hidden" name="username" value="xchopath@wearehackerone.com">
<input type="hidden" name="role" value="admin">
<button>Submit</button>
</form>
```

After the HTML Injection payload was submitted, I asked the admin (my partner as the organization owner) to submit the form and this was the result.

![account created]({{ "/assets/img/uploads/posts/2025/12/2025-12-22-account-created.png" | relative_url }})

After we successfully pulled off the PoC, we wasted no time reporting the finding. And the moment of truth...

![account created]({{ "/assets/img/uploads/posts/2025/12/2025-12-22-hackerone-result.png" | relative_url }})

**Summary**

- When **encountering a seemingly low-impact bug** (such as HTML Injection), avoid rushing to report it. Take time to analyze potential attack chains.
- Sometimes **2 low-hanging bugs combined** can **lead to a high-critical impact**.
- If you come across **HTML Injection & Lack of Token-based CSRF protection**, you may be looking at a serious security issue.
- The **SameSite** attribute only provides protection against "Cross-Site" Request Forgery (CSRF). For comprehensive mitigation, a **token-based CSRF protection** is strongly recommended.