// Make requests to Twitter
var Twitter = (function ()  {
  var my = {};
  
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