/**
 * runtime: chrome extension inject to web
 * usage: Because content script can only access to BOM but not DOM,
 *      content script will inject inpage script when chrome update by append script tag
 * message stream:
 *       background ->{chrome.runtime.onConnect.addListener,  chrome.runtime.connect} <- content
 *       inpage -> {PostMessage, addEventListener} <- content
 */
function injectScript(file, node) {
    const th = document.getElementsByTagName(node)[0];
    const s = document.createElement("script");
    s.setAttribute("type", "text/javascript");
    s.setAttribute("src", file);
    th.appendChild(s);
}

function injectFontFamily(name: string, path: string) {
    const head = document.head;
    const style = document.createElement("style");
    style.type = "text/css";
    style.textContent =
        "@font-face { font-family: " +
        name +
        '; src: url("' +
        chrome.extension.getURL(path) +
        '"); }';
    head.appendChild(style);
}

const inject = () => {
    injectScript(chrome.extension.getURL("/js/inpage.js"), "body");
    injectScript(chrome.extension.getURL("/js/vendor.js"), "body");
    injectFontFamily("Sansation", "assets/sansation.ttf");
};

// relay

chrome.runtime.sendMessage({ type: "getTabId" }, function (res) {
    const { tabId } = res;
    const portName = `tab:${tabId}`;

    // message stream: page-[window]-contentscript-[port]-background
    const port = chrome.runtime.connect({ name: portName }); // connection to bg
    port.onMessage.addListener((msg) => {
        window.postMessage(
            {
                type: "FROM_CONTENT",
                text: JSON.stringify(msg)
            },
            "*"
        );
    });

    window.addEventListener("message", (event) => {
        if (event.source != window) return;
        if (event.data.type && event.data.type == "FROM_PAGE") {
            const payload = JSON.parse(event.data.text);
            port.postMessage(payload);
        }
    });

    chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
    ) {
        // listen for messages sent from background.js
        if (request.message === "inject") {
            console.log("url change!try to inject");
            setTimeout(() => {
                inject(); // new url is now in content scripts!
                setTimeout(() => {
                    window.postMessage(
                        {
                            type: "CREATEINVOKER",
                            tabId: tabId
                        },
                        "*"
                    );
                }, 500);
            }, 500);
        }
    });
});
