# Carryall.js

A conditional, self-contained, lazily-evaluating script loader.

## Purpose

Carryall was designed for a very specific use case: the ability to conditionally load scripts without making http requests.  

## History

We built a browser testing tool called [RedGlass](https://github.com/fohara/red-glass) which injects JavaScript into an automated browser session via Selenium (or otherwise), and it needed a way to conditionally load shims to support its primary script.  Since we are injecting script directly into the browser session, there was no “server” which a conditional script loader could call to fetch additional scripts. Conventionally designed script loaders, which assume the presence of a script server, could therefor not be used.  We built Carryall to address this use case.

We have previously conditionally loaded scripts in RedGlass by iterating through the conditions via the test automation API: driver.execute_script(“return typeof jQuery == 'function';”). This worked well enough, however, we wanted redglass.js to be self-contained, and load whichever scripts it needed independently on the client side.  Carryall.js enabled us to accomplish that.

## How It Works

Carryall uses lazy evaluation to load scripts.  Scripts are stored as string cargo, and are only evaluated if needed.  In this way, Carryall is self-contained: it carries its script payload around with it.  If you're interested in this concept, you can read about it [here](http://tomdale.net/2012/01/amd-is-not-the-answer/) and [here](http://calendar.perfplanet.com/2011/lazy-evaluation-of-commonjs-modules/).

## Usage

Carryall does one thing: deliver scripts.  To use it, pass it a manifest and cargo:

```javascript
var manifest = [{'check': true, 'checkPassed': ['foo.js']}];
var cargo = [{'name': 'foo.js', 'payload': "window.foo = function foo() {return 'foo';};"}];
Carryall.deliver(manifest, cargo);

// You may now call foo().
```
## Generation

Don't want to type out your own Carryall delivery files (like the one above), eh?  You're in luck: they can be generated with the carryall-packer build tool (via npm on node.js).