---
layout: page
title: Contact
permalink: /contact/
eyebrow: // say hello
subtitle: Questions, corrections, collaborations — the inbox is open.
description: Get in touch with the Flawseekr collective.
---

<div class="contact not-prose">
  <div class="contact__intro">
    <p>The fastest way to reach us is email. We read everything and reply to most
    things — corrections and interesting problems jump the queue.</p>

    <ul class="contact__channels">
      <li>
        <span class="contact__k">Email</span>
        <a href="mailto:{{ site.contact.email }}">{{ site.contact.email }}</a>
      </li>
      {%- if site.contact.github -%}
      <li>
        <span class="contact__k">GitHub</span>
        <a href="https://github.com/{{ site.contact.github }}" rel="noopener">@{{ site.contact.github }}</a>
      </li>
      {%- endif -%}
      {%- if site.contact.twitter -%}
      <li>
        <span class="contact__k">Twitter</span>
        <a href="https://twitter.com/{{ site.contact.twitter }}" rel="noopener">@{{ site.contact.twitter }}</a>
      </li>
      {%- endif -%}
      {%- if site.contact.linkedin -%}
      <li>
        <span class="contact__k">LinkedIn</span>
        <a href="https://linkedin.com/company/{{ site.contact.linkedin }}" rel="noopener">{{ site.contact.linkedin }}</a>
      </li>
      {%- endif -%}
    </ul>
  </div>

  {%- comment -%}
    Static form via Formspree. Swap for Netlify Forms by adding `netlify`
    to the <form> tag instead, if you ever move hosts.
  {%- endcomment -%}
  <form class="contact__form card" action="https://formspree.io/f/xkonnrww" method="POST">
    {%- comment -%} Honeypot: real visitors never see or fill this field (see
      Formspree's _gotcha convention); bots that auto-fill every input do,
      and Formspree silently drops the submission. {%- endcomment -%}
    <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off">
    <div class="field">
      <label for="name">Name</label>
      <input type="text" id="name" name="name" required autocomplete="name">
    </div>
    <div class="field">
      <label for="email">Email</label>
      <input type="email" id="email" name="email" required autocomplete="email">
    </div>
    <div class="field">
      <label for="message">Message</label>
      <textarea id="message" name="message" rows="5" required></textarea>
    </div>
    <button type="submit" class="btn btn--primary">Send message</button>
    <p class="field__hint muted">This form posts to Formspree.</p>
  </form>
</div>
