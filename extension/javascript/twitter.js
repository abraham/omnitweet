// Make requests to Twitter
var Twitter = (function ()  {
  var my = {};
  my.current_requests = {mentions: false, direct_messages: false};

  // Get mentions
  my.mentions = function(init) {
    if (my.current_requests.mentions) {
      return false;
    }
    var callback = function(result) {
      if (200 == result.status && result.data.length){
        localStorage.statuses_last_id = result.data[0].id;
        for(var status in result.data) {
          Status.save(result.data[status]);
          Notice.status(result.data[status].id);
        }
      }
      my.current_requests.mentions = false;
      console.log('Pulled new mentions :)');
    };
    var parameters = {};
    if (localStorage.statuses_last_id) {
      parameters.since_id = localStorage.statuses_last_id;
    }
    // Make request to Twitter for mentions.
    Twitter.get('statuses/mentions', callback, parameters);
  }
  
  // Get direct messages
  my.direct_messages = function(init) {
    if (my.current_requests.direct_messages) {
      return false;
    }
    var callback = function(result) {
      if (200 == result.status && result.data.length){
        localStorage.direct_messages_last_id = result.data[0].id;
        for(var direct_messages in result.data) {
          DirectMessage.save(result.data[direct_messages]);
          Notice.direct_message(result.data[direct_messages].id);
        }
      }
      my.current_requests.direct_messages = false;
      console.log('Pulled new direct message :)');
    };
    var parameters = {};
    if (localStorage.direct_messages_last_id) {
      parameters.since_id = localStorage.direct_messages_last_id;
    }
    // Make request to Twitter for direct messages.
    Twitter.get('direct_messages', callback, parameters);
  }
  
  // Make a GET request.
  my.get = function(path, callback, parameters) {
    my.http('GET', path, callback, parameters);
  }
  
  // Make a POST request.
  my.post = function(path, callback, parameters) {
    my.http('POST', path, callback, parameters);
  }
  
  // Makes the HTTP request to Twitter. Don't call directly.
  my.http = function(method, path, callback, params) {
    parameters = {method: method};
    if (params) {
      parameters.parameters = params;
    }
    // Decode the JSON response.
    var callbackWrapper = function(data, xhr) {
      
      if (xhr.status != 200 && xhr.status >= 500) {
        callback({data: data, status: xhr.status})
      } else {
        callback({data:JSON.parse(data), status: xhr.status});
      }
    }
    oauth.sendSignedRequest(my.buildUrl(path), callbackWrapper, parameters);
  }
  
  // Take the Twitter API path and build full API URL.
  my.buildUrl = function(path) {
    return 'https://api.twitter.com/1/' + path + '.json';
  }
  
  return my;
}());