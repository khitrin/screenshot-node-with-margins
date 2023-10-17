const port = chrome.runtime;

port.onMessage.addListener(function (msg) {
  console.log("page", msg);
  if (msg.type === "img") {
    const val = "data:image/png;base64," + msg.data;
    document.getElementById("img").src = val;

    if (document.getElementById("autodownload").checked) {
      const link = document.createElement("a");
      link.download = "node_screenshot.png";
      link.href = val;
      link.click();
    }
  }
});

function onCapture() {
  const margin = document.getElementById("margin").value;
  const shadow = document.getElementById("shadow").value;
  const forceParentOverflowVisible = document.getElementById("forceParentOverflowVisible").checked;
  const forcePositionRelative = document.getElementById("forcePositionRelative").checked;
  port.sendMessage({type: "doScreenshot", margin: margin, shadow: shadow, forceParentOverflowVisible, forcePositionRelative});
}

function onScaleDown() {
  if (this.checked) {
    document.getElementById("img").classList.remove("no-scale-down");
  } else {
    document.getElementById("img").classList.add("no-scale-down");
  }
}

function onImageLoad() {
  this.style.width = (0.5 * this.naturalWidth) + "px";
  this.style.height = (0.5 * this.naturalHeight) + "px";
}

document.getElementById("capture").onclick = onCapture;
document.getElementById("scaledown").onchange = onScaleDown;
document.getElementById("img").onload = onImageLoad;
