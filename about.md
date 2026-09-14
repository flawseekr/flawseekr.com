---
layout: page
title: Who We Are
permalink: /about/
eyebrow: // about
subtitle: We found a few bugs once and haven't stopped talking about it since.
description: The people behind Flawseekr, why we do this, and the questionable life choices that led here.
---

## Our story

Flawseekr started as a group chat that got out of hand. A few people who kept
sending each other _"you have to read this"_ links at 2am decided the internet
clearly needed more of us, in long form. So here we are, writing up bugs nobody
asked us to find.

We tell ourselves we do it for the community. Realistically we do it so we have
something to point at when someone asks what we've been doing instead of
sleeping.

## What we value

- **Depth over hot takes.** If it fits in a tweet, we will somehow turn it into
  three thousand words anyway.
- **Reproducibility.** We show the commands, mostly so you can confirm we did not
  make the whole thing up.
- **Kindness.** Strong opinions, loosely held, delivered right after we quietly
  google to check we are actually right.
- **Open by default.** Everything here is free, which is convenient, because
  nobody would pay for it.

## What we write about

Web and mobile security, bug bounty writeups, and whatever rabbit hole swallowed
the weekend. If something broke in an interesting way, there is a good chance we
wrote two thousand words about it. Browse the
[blog]({{ '/blog/' | relative_url }}), or filter by category and tag if you are
after a specific flavor of our poor decisions.

## The team

By "team" we mean one person with a terminal and some commitment issues. The
support group is accepting new members, in theory.

<div class="card-grid card-grid--team not-prose">
  {%- for m in site.data.team -%}{%- include team-card.html member=m -%}{%- endfor -%}
</div>

## Say hello

Got a question, a correction, or actual proof that we are wrong? Especially that
last one. [Reach out]({{ '/contact/' | relative_url }}) and make our day.
