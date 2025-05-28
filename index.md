---
layout: default # default.html レイアウトを使用
title: Home # このページのタイトル (英語に変更)
---

<p style="text-align: center; font-size: 0.9em; color: #555;"><em>New wisdom is delivered daily around 10:00 AM PDT.</em></p>

## Latest Quotes

{% if site.posts.size > 0 %}
  <ul class="post-list">
    {% for post in site.posts %}
      <li>
        <h3>
          <a href="{{ post.url | relative_url }}">
            {{ post.title }}
          </a>
        </h3>
        <p class="post-meta">
          <time datetime="{{ page.date | date_to_xmlschema }}">
            {{ post.date | date: "%Y-%m-%d" }} </time>
        </p>
        </li>
    {% endfor %}
  </ul>
{% else %}
  <p>No posts yet.</p>
{% endif %}
