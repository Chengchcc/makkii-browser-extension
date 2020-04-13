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
    injectFontFamily("Makkii", "assets/makkii.ttf");
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // listen for messages sent from background.js
    if (request.message === "inject") {
        console.log("url change!try to inject");
        setTimeout(() => {
            inject(); // new url is now in content scripts!
        }, 500);
    }
});
