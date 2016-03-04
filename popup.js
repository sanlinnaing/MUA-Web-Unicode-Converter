chrome.storage.sync.get("data", function(items) {
    if (!chrome.runtime.error) {
      //console.log(items);
      var enableMUA = items.data;
      if(enableMUA == "disable") {
        document.getElementById('muaonoffswitch').checked = false;
      } else {
        document.getElementById('muaonoffswitch').checked = true;
      }
    } 
});

function enableNow() {
  chrome.browserAction.setIcon({path:"icon.png"});
  chrome.storage.sync.set({ "data" : "enable" }, function() {
    if (chrome.runtime.error) {
      console.log("Runtime error.");
    }
  });
}

function disableNow() {
  chrome.browserAction.setIcon({path:"icon_disabled.png"});
  chrome.storage.sync.set({ "data" : "disable" }, function() {
    if (chrome.runtime.error) {
      console.log("Runtime error.");
    }
  });
}

function exit() {
  window.close();
}

function switchNow() {
  //alert(document.getElementById('muaonoffswitch').checked);
  if(document.getElementById('muaonoffswitch').checked == true) {
    enableNow();
  } else {
    disableNow();
  }
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('close').addEventListener('click', exit);
  document.getElementById('muaonoffswitch').addEventListener('click', switchNow);
  //main();
});