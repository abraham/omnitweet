// Work with statuses
var Status = (function ()  {
  var my = {};
  
  // Save a status object to localStorage
  my.save = function(status){
    return localStorage['status_' + status.id] = JSON.stringify(status);
  }
  
  // Get the status object matching the id
  my.get = function(id) {
    console.log(typeof JSON.parse(localStorage['status_' + id]))
    return JSON.parse(localStorage['status_' + id]);
  }
  
  return my;
}());