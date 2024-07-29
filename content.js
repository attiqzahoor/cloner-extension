let clonedHTML, clonedCSS, clonedJS;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "clonePage") {
    clonePage();
    sendResponse({success: true});
  } else if (request.action === "downloadFiles") {
    downloadFiles();
  }
  return true;
});

function clonePage() {
  // Clone HTML
  clonedHTML = document.documentElement.outerHTML;

  // Clone CSS
  clonedCSS = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules)
          .map(rule => rule.cssText)
          .join('\n');
      } catch (e) {
        console.warn('Cannot access stylesheet', e);
        return '';
      }
    })
    .join('\n');

  // Clone JS
  clonedJS = Array.from(document.scripts)
    .map(script => script.innerHTML)
    .join('\n\n');
}

function downloadFiles() {
  // Download HTML
  downloadFile('cloned_page.html', clonedHTML, 'text/html');

  // Download CSS
  downloadFile('cloned_styles.css', clonedCSS, 'text/css');

  // Download JS
  downloadFile('cloned_scripts.js', clonedJS, 'application/javascript');
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], {type: type});
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: true
  });
}