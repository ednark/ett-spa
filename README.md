This is an Emergent Task Timer designed as close to [David Seah's ETT](https://davidseah.com/) as I could make it. It is meant to help you track your time in 15 minute blocks and works well in situations where you are working in an environment with distractions.

## Table of contents

- [Quick start](#quick-start)
- [Status](#status)
- [What's included](#whats-included)
- [Thanks](#thanks)

## Quick start

This application functions as a single page app and needs to be accessed through a browser. Since it relies on localStorage and separate js files, it requires a webserver to be running.

While any webserver will do, there is a start script included for convenience that attempts to find a webserver on the local system to run what is finds against the current directory. The start script should be run directly from the repository root.

- run `./start`

## Status

This is a constant work in progress. Although I do use this app on a day-to-day basis, it is mostly a personal project to fiddle with vanilla javascript front-end rendering techniques without using a framework.

## What's included

Mostly just and index.html file with supporting css, js, and images.

```
index.html
start
favicon.ico
css/
└── layout + styles
img/
└── supporting images
js/
├── ett app
├── date picker
└── modules/
    ├── bubbles
    ├── tasks
    ├── hours
    └── storage
```

## Thanks

- Concept and UI design by [David Seah](https://davidseah.com/)>
