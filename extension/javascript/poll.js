// Polling stuff :)
var Poll = (function ()  {
  var my = {};
  my.frequency = localStorage.poll_frequency ? parseInt(localStorage.poll_frequency) : 3;
  my.current_request = false;
  
  // Start polling for 
  my.start = function(){
    Twitter.mentions();
    Twitter.direct_messages();
    my.reset();
  }
  
  // Get the status object matching the id
  my.reset = function() {
    window.setTimeout('Poll.start();', Poll.frequency * 60 * 1000);
  }
  
  return my;
}());