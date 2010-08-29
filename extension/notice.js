// Show notifications to user.
var Notice = (function ()  {
  var my = {};
  
  // Show error notice.
  my.error = function(type, text){
    var notification = webkitNotifications.createNotification(
      'error.png',
      type,
      text
    );
    notification.show();
  }

  return my;
}());