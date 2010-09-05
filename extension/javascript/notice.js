// Show notifications to user.
var Notice = (function ()  {
  var my = {};
  
  my.last_id = {
    info_bar: 0,
    page_action: 0
  };
  
  // Show error notice.
  my.error = function(type, text){
    var notification = webkitNotifications.createNotification(
      'images/error.png',
      type,
      text
    );
    notification.show();
  }

  // Show status notice
  my.status = function(id) {
    if (!localStorage['status_' + id]) {
      console.log('Suck! Tried to load missing status :(')
      return false;
    }
    var notification = webkitNotifications.createHTMLNotification('status.html?id=' + id);
    notification.show();
  }
  
  // Show direct message notice
  my.direct_message = function(id) {
    var notification = webkitNotifications.createHTMLNotification('direct_message.html?id=' + id);
    notification.show();
  }

  // Draw the available character count page action.
  my.count = function(count) {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.textAlign = "center";
    context.fillStyle = '#CCCCCC';
    context.textBaseline = "middle";
    context.font = "bold 12px Helvetica Neue";
    if (count < 10) {
      context.fillStyle = '#D40D12';
    } else if(count < 20) {
      context.fillStyle = '#5C0002';
    }
    context.fillText(count, 9.5, 10);
    return context.getImageData(0, 0, 19, 19);
  }

  // Modify or remove page actions.
  my.show_page_action = function(count) {
    chrome.tabs.getSelected(null, function(tab) {
      my.last_id.page_action = tab.id;
      chrome.pageAction.show(tab.id);
      chrome.pageAction.setIcon({imageData: Notice.count(count), tabId: tab.id});
    });
  }

  my.hide_page_action = function() {
    if (my.last_id.page_action) {
      chrome.pageAction.hide(my.last_id.page_action);
      my.last_id.page_action = 0;
    }
  }

  my.show_info_bar = function(text) {
    chrome.tabs.getSelected(null, function(tab) {
      my.last_id.info_bar = tab.id;
      chrome.experimental.infobars.show({tabId: tab.id, path: 'infobar.html?text=' + text});
    });
  }
  return my;
}());