document.getElementById('captureScreenshot').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: takeScreenshot
      });
    });
  });
  
  function takeScreenshot() {
    chrome.scripting.captureVisibleTab({ format: 'png' }, function(screenshotUrl) {
      fetch('http://your-backend-server.com/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ screenshotUrl: screenshotUrl })
      }).then(response => {
        console.log('Screenshot sent for processing');
      }).catch(error => {
        console.error('Error sending screenshot:', error);
      });
    });
  }
  
