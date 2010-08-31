// Work with direct messages
var DirectMessage = (function ()  {
  var my = {};
  
  // Save a direct message object to localStorage
  my.save = function(direct_message){
    return localStorage['direct_message_' + direct_message.id] = JSON.stringify(direct_message);
  }
  
  // Get the direct message object matching the id
  my.get = function(id) {
    return JSON.parse(localStorage['direct_message_' + id]);
  }
  
  return my;
}());