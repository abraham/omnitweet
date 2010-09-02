// Polling stuff :)
var Poll = (function ()  {
  var my = {};
  my.frequency = localStorage.poll_frequency ? parseInt(localStorage.poll_frequency) : 3;
  my.current_request = false;
  
  // Start polling for 
  my.start = function(){
    if (localStorage.poll_for_mentions != 'disabled') {
      Twitter.mentions();
    }
    if (localStorage.poll_for_direct_messages != 'disabled') {
      Twitter.direct_messages();
    }
    my.reset();
  }
  
  // Get the status object matching the id
  my.reset = function() {
    my.frequency = localStorage.poll_frequency && parseInt(localStorage.poll_frequency) >= 1? parseInt(localStorage.poll_frequency) : 3;
    window.setTimeout('Poll.start();', Poll.frequency * 60 * 1000);
  }
  
  return my;
}());