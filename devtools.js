chrome.devtools.panels.elements.createSidebarPane(
    "Screenshot node with margin",
    function (sidebar) {
      sidebar.setPage("sidebar.html");

      const port = chrome.runtime;
      port.onMessage.addListener(function (msg) {
        if (msg.type === "doScreenshot") {
          doScreenshot(msg.margin, msg.shadow);
        }
      });

      async function doScreenshot(margin, shadow) {
        try {
          await chrome.debugger.attach({tabId: chrome.devtools.inspectedWindow.tabId}, "1.3");
        } catch (error) {
          // TODO: find out how to reliably detect is debugger attached or not on devtools reopen
          if (!error.message.startsWith("Another debugger is already attached to the tab")) {
            throw error; // TODO: pass error to user
          }
        }
        try {
          const {bbox, nodeStyle} =
              await evalInWindow("(" + modifyNodeAndGetClip.toString() + ")(" + JSON.stringify(shadow) + ")");
          try {
            const x = Math.floor(bbox.x - margin);
            const y = Math.floor(bbox.y - margin);
            let width = Math.ceil(bbox.width + 2 * margin);
            let height = Math.ceil(bbox.height + 2 * margin);

            const img = await chrome.debugger.sendCommand(
                {tabId: chrome.devtools.inspectedWindow.tabId},
                "Page.captureScreenshot",
                {
                  format: "png",
                  captureBeyondViewport: false,
                  clip: {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    scale: 1
                  }
                }
            );
            port.sendMessage({type: "img", data: img.data});
          } finally {
            await evalInWindow("(" + repairNode.toString() + ")(" + JSON.stringify(nodeStyle) + ")");
          }
        } catch (error) {
          throw error; // TODO: pass error to user
        }
      }

      function evalInWindow(code) {
        return new Promise((resolve, reject) => chrome.devtools.inspectedWindow.eval(code, {}, (result, exceptionInfo) => {
          if (exceptionInfo) {
            reject(exceptionInfo.code + ": " + exceptionInfo.description);
          } else {
            resolve(result);
          }
        }));
      }

      const modifyNodeAndGetClip = (shadow) => {
        const SHADOWS = {
          "elevation1": "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
          "elevation2": "0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)",
          "elevation4": "0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)",
          "elevation8": "0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)",
          "black1": "0 0 0 1px black",
          "black2": "0 0 0 2px black",
          "grey1": "0 0 0 1px grey",
          "grey2": "0 0 0 2px grey",
        };

        const el = $0;
        const computedStyle = window.getComputedStyle(el);
        const nodeShadow = computedStyle.boxShadow;
        const nodeStyle = $0.getAttribute("style");

        let modShadow;
        const bigWhiteShadow = "0 0 0 64px white !important";

        let extraStyle = ";transition: unset !important;z-index: 99999 !important";

        if (computedStyle.display === "inline") {
          extraStyle += ";display:inline-block";
        }

        switch (shadow) {
          case "original":
            if (nodeShadow !== "none") {
              modShadow = nodeShadow + "," + bigWhiteShadow;
            } else {
              modShadow = bigWhiteShadow;
            }
            break;
          case "none":
            modShadow = bigWhiteShadow;
            break;
          default:
            modShadow = SHADOWS[shadow] + "," + bigWhiteShadow;
        }

        const newStyle = (nodeStyle || "") + ";box-shadow:" + modShadow + extraStyle;
        $0.setAttribute("style", newStyle);

        const bbox = el.getBoundingClientRect();
        return {bbox: {x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height}, nodeStyle};
      };

      const repairNode = (nodeStyle) => {
        const el = $0;
        if (nodeStyle !== null) {
          el.setAttribute("style", nodeStyle);
        } else {
          el.removeAttribute("style");
        }
      };
    }
);
