function insertStyleElement(styleElement) {
  var head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(styleElement);
}

function appendStyleContent(styleElement, content) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = content;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(content));
  }
}

function createStyleElement(css, id) {
  var styleElement = document.querySelector('[data-src="' + id + '"]') || document.createElement('style');

  if (!styleElement.parentNode) {
    styleElement.setAttribute('type', 'text/css');
    styleElement.setAttribute('data-src', id);
    styleElement.setAttribute('data-tpa-style', '');

    appendStyleContent(styleElement, css);
    insertStyleElement(styleElement);
  } else {
    styleElement.originalTemplate = css;
    styleElement.setAttribute('hot-reloaded', 'true');
  }
  return styleElement;
}

export function addStyles(css, id) {
  if (typeof document !== 'object') {
    throw new Error('The tpa-style-inject cannot be used in a non-browser environment');
  }

  createStyleElement(css, id);
}
