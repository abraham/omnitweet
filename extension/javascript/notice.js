// Show notifications to user.
var Notice = (function ()  {
  var my = {};
  
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
    var notification = webkitNotifications.createHTMLNotification('status.html?id=' + id);
    notification.show();
  }
  
  return my;
}());