// Show notifications to user.
var Notice = (function ()  {
  var my = {};
  
  my.last_id = {
    info_bar: 0
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

  my.show_info_bar = function(message) {
    localStorage.info_bar_message = message;
    chrome.tabs.getSelected(null, function(tab) {
      my.last_id.info_bar = tab.id;
      chrome.experimental.infobars.show({tabId: tab.id, path: 'infobar.html'});
    });
  }
  return my;
}());