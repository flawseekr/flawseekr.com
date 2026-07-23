---
title: "A $3,500 HTML Injection, Escalating a Low Bug with a CSRF-like"
date: 2025-12-22
author: xchopath
category: Web Security
tags: [html-injection, csrf, bug-bounty, xss]
read_time: 8
description: >-
  A reflected HTML injection my partner was about to file as low. Here is the
  investigation that turned it into an account takeover, including the XSS path
  that failed first.
---

My teammate [@fariqfgi](https://x.com/fariqfgi) sent me a screenshot: his
`<h1>test</h1>` payload rendering as a real heading inside the org dashboard. His
message was "it's just reflected markup, they'll close it low." He was half
right. A bare HTML injection with no script
execution usually is low. I asked him to hold the report for a day, because one
detail in the screenshot bothered me: the payload was rendering on an
authenticated dashboard page, not on a public marketing page. Whatever I could
inject would run in the victim's logged-in, same-origin context. That is a very
different starting point from an injection on a page nobody is authenticated to.

## First attempt: turn it into XSS (this failed)

My first move was the obvious one. If I can get script execution on an
authenticated origin, the impact is obvious. So I stopped thinking about impact
and just tried to escalate the injection into XSS, because that is the shortest
path to something a triager will take seriously.

I worked through the usual escalation payloads:

```html
<script>alert(document.domain)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
```

None of them executed. The `<script>` element rendered into the DOM but never
ran, and the event handlers were stripped from the attributes before the markup
reached the page. I couldn't tell from the outside whether that was server-side
sanitization or a CSP blocking inline execution, and honestly it didn't matter.
What mattered was the evidence in front of me: markup elements survived, script
and event handlers did not. My cleanest escalation path was dead.

That is usually the moment people mark it low and move on. I almost did.

> The tags that survive sanitization tell you what you have
> left to work with. Here, `<script>` and `on*` handlers were gone but structural
> elements like `<form>` and `<input>` rendered untouched. When JS is off the
> table, stop asking "how do I run code?" and start asking "what can pure HTML on
> a same-origin page still do?"

## What plain HTML can still do

Plain HTML can't run logic, but it can build a form, and a form can send a
request. So the question shifted from "can I execute JavaScript?" to "is there a
state-changing action on this app that a form could trigger without needing a
token I don't have?"

That reframing is what unlocked the finding, so it's worth being precise about
why it mattered. A cross-site request forgery normally dies on two things: the target
using a per-request CSRF token, or the browser refusing to attach cookies to a
cross-site request. If either holds, my injected form is useless. So before
building anything, I needed evidence about how this app actually protected its
sensitive writes.

## Does the app actually use CSRF tokens?

I went to the most sensitive feature I could find, the user-management panel, and
watched the request that adds a member to the organization. The reason I picked
that one specifically: if I could forge it, the impact would be an admin account,
not some cosmetic change. High ceiling, worth the effort.

Here is what the add-member request looked like in the proxy:

```http
POST /manage/users HTTP/1.1
Host: app.target.tld
Cookie: session=<admin session cookie>
Content-Type: application/x-www-form-urlencoded

username=teammate@example.com&role=member
```

Two things stood out, and both were things that were *absent*. There was no CSRF
token anywhere in the body or headers, and there was no re-authentication step
before a role was assigned. To confirm the token really wasn't being checked
rather than just being invisible to me, I replayed the request from a fresh tab
with nothing but the session cookie. It still created the user. That was the
evidence I needed: the only thing gating this action was the presence of a valid
session cookie.

At this point I expected to hit the second wall, SameSite. The app set its
session cookie `SameSite=Lax`, which is exactly the control that is supposed to
stop a forged cross-site form. For a minute I thought that killed it.

## My form isn't cross-site

Then the injection point came back to mind and the SameSite objection fell apart.
SameSite only restricts cookies when the request originates from a *different*
site. My forged form would not be hosted on `evil.com`. It would be injected into
a page on `app.target.tld`, the target's own origin. From the browser's point of
view the request is same-site, so the cookie ships normally and SameSite never
enters the picture.

That is the difference between classic CSRF and what I had. Classic CSRF fights
the cross-site boundary. HTML injection lets you stand *inside* the boundary and
send the request from the app's own origin, which is precisely the case SameSite
was never designed to stop.

> An app leaning on `SameSite` instead of a real CSRF token
> is only protected as long as the attacker stays cross-site. The moment you have
> any same-origin injection primitive, HTML injection included, SameSite stops
> being a control. When you see cookie-only auth on a write endpoint, note it, and
> keep it in your back pocket for exactly this kind of chain.

## The payload

With the reasoning settled, the exploit was small. I injected an auto-submitting
form pointed at the add-member endpoint, with my own email and the admin role:

```html
<form action="/manage/users" method="POST">
  <input type="hidden" name="username" value="xchopath@wearehackerone.com">
  <input type="hidden" name="role" value="admin">
  <button>Submit</button>
</form>
```

When an admin loads the injected page and the form fires, the browser does what
it always does: it attaches the valid session cookie and posts to
`/manage/users` from the same origin. The server sees a well-formed,
authenticated request from an admin and provisions a new administrator tied to my
email. From there it is a normal account takeover. I control an admin inside the
organization.

## What actually made this pay

The triage team did not reward the HTML injection. On its own it was still the
low-severity bug my partner described. They rewarded the chain: a cosmetic-looking
primitive reached privilege escalation because a second control, a real CSRF
token, was missing, and because SameSite created a false sense that the write was
protected. It paid **$3,500**.

Looking back, the decisions that mattered were not the payload. They were the
smaller judgment calls:

- I didn't stop when the XSS path failed. The failed escalation told me what
  primitive I still had (form injection on a same-origin authenticated page)
  rather than telling me to give up.
- I checked how a write endpoint was actually protected before assuming it was
  protected. The absence of a CSRF token was observable, and I confirmed it by
  replaying the request rather than guessing.
- I treated SameSite as a mitigation with a specific scope, not as CSRF
  protection. Knowing what it does *not* cover is what connected the two halves.

My partner nearly filed this as a screenshot of a rendered `<h1>`. The real bug
was everything that injection could reach once we stopped treating it as an XSS
that didn't work.
