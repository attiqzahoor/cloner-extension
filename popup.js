document.addEventListener('DOMContentLoaded', function() {
    const cloneButton = document.getElementById('cloneButton');
    const downloadButton = document.getElementById('downloadButton');
  
    cloneButton.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.scripting.executeScript({
          target: {tabId: tabs[0].id},
          function: clonePage
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          } else if (results && results[0] && results[0].result) {
            downloadButton.disabled = false;
          }
        });
      });
    });
  
    downloadButton.addEventListener('click', function() {
      chrome.storage.local.get(['clonedHTML', 'clonedCSS', 'clonedJS'], function(result) {
        downloadFile('cloned_page.html', result.clonedHTML, 'text/html');
        downloadFile('cloned_styles.css', result.clonedCSS, 'text/css');
        downloadFile('cloned_scripts.js', result.clonedJS, 'application/javascript');
      });
    });
  });
  
  function clonePage() {
    // Clone HTML
    const clonedHTML = document.documentElement.outerHTML;
  
    // Clone CSS
    const clonedCSS = Array.from(document.styleSheets)
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
    const clonedJS = Array.from(document.scripts)
      .map(script => script.innerHTML)
      .join('\n\n');
  
    // Store cloned data in chrome.storage
    chrome.storage.local.set({
      clonedHTML: clonedHTML,
      clonedCSS: clonedCSS,
      clonedJS: clonedJS
    });
  
    return true;
  }
  
  function downloadFile(filename, content, type) {
    const blob = new Blob([content], {type: type});
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log(`File ${filename} started downloading. Download ID: ${downloadId}`);
      }
    });
  }