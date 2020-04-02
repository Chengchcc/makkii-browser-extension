function injectScript(file, node) {
    const th = document.getElementsByTagName(node)[0];
    const s = document.createElement("script");
    s.setAttribute("type", "text/javascript");
    s.setAttribute("src", file);
    th.appendChild(s);
}

injectScript(chrome.extension.getURL("/js/inpage.js"), "body");
