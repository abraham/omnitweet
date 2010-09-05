// Location functions
var Location = (function ()  {
  var my = {};
  my.current_requests = {
    search: false
  };

  // Check if location is enabled.
  my.enabled = function() {
    return localStorage.geo_enabled != 'disabled' ? true : false;
  }

  // Check if current location needs to be updated.
  my.stale = function() {
    var d = new Date();
    var time = Math.floor(d.getTime() / 1000);
    return !localStorage.geo_touched || parseInt(localStorage.geo_touched) + 15 * 60 < time ? true : false;
  }
  
  // Update the last time locations were updated.
  my.touch = function() {
    var d = new Date();
    localStorage.geo_touched = Math.floor(d.getTime() / 1000);
  }
  
  // Get nearby places.
  my.current = function(options) {
    var result = false;
    if (my.enabled()) {
      if (my.stale() || (options && options.force)) {
        my.search();
      } else {
        result = localStorage.places ? JSON.parse(localStorage.places) : false;
      }
    }
    return result;
  }
  
  // Search Twitter for nearby places
  my.search = function(options) {
    if (my.current_requests.search || !my.enabled) {
      return false;
    }
    my.current_requests.search = true;
    navigator.geolocation.getCurrentPosition(function(position) {
      if(!position) {
        return false;
      }
      var callback = function(result) {
        if (200 == result.status && result.data.result.places.length){
          var places = [];
          for(var place in result.data.result.places) {
            places.push({
              name: result.data.result.places[place].name,
              id: result.data.result.places[place].id
            });
          }
          // Cache places locally.
          localStorage.places = JSON.stringify(places);
          localStorage.latitude = position.coords.latitude;
          localStorage.longitude = position.coords.longitude;
        } else {
          // Notify user of failure to update location. But not too often.
          if(my.stale()){
            infoBar();
          }
        }
        currentLocationRequest = false;
        my.touch();
        console.log('Location updated :)');
      };
      var parameters = {
        lat: position.coords.latitude,
        long: position.coords.longitude,
        max_results: 5
      };
      // Make request to Twitter for nearby places.
      Twitter.get('geo/search', callback, parameters);
    });
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