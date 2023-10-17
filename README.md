# screenshot-node-with-margins

Simple extension for Google Chrome DevTools to capture a screenshot of a single node with custom margins and shadow or border.

## Disclaimer
**This is an unpublished extension, use it at your own risk.**

**It uses the debugger protocol and modifies element styles for a short time.**

**It can interfere with any virtual DOM renderer, cause page resizing, and trigger mutation and intersection observers.**

## Installation
1. Clone this repository.
2. Enable Developer mode in Extensions.
3. Add the extension using the "Load unpacked" button.

## Update
1. Pull the repository.
2. Press the Update button on the extension card.
3. Re-open DevTools (the updated extension will be unresponsive until re-opened).

## Usage
1. Open DevTools.
2. Go to Elements tab and pick an element.
3. Open "Screenshot node with margins" sidebar.
4. Set margins and shadows and press "Capture".
5. "Force" options can sometimes help if the captured area contains unwanted page parts, but can also break the page or element layout.

## Current limitations
* Captures only the visible area.
* Replaces only `overflow: hidden` with `overflow: visible` for parent elements (in force mode), can't overcome `overflow: scroll`.
* Always replaces `display: inline` with `display: inline-block` for selected element.
