// Make requests to Twitter
var Twitter = (function ()  {
  var my = {};
  my.current_requests = {
    mentions: false,
    direct_messages: false,
    verify_credentials: false,
    status: false,
    update: false
  };

  // Get mentions
  my.mentions = function(options) {
    if (my.current_requests.mentions) {
      return false;
    }
    var callback = function(result) {
      if (200 == result.status && result.data.length){
        localStorage.statuses_last_id = result.data[0].id_str;
        for(var status in result.data) {
          Status.save(result.data[status]);
          if (!options || options && options.silent != true) {
            Notice.status(result.data[status].id_str);
          }
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
  my.direct_messages = function(options) {
    if (my.current_requests.direct_messages) {
      return false;
    }
    var callback = function(result) {
      if (200 == result.status && result.data.length){
        localStorage.direct_messages_last_id = result.data[0].id_str;
        for(var direct_messages in result.data) {
          DirectMessage.save(result.data[direct_messages]);
          if (!options || options && options.silent != true) {
            Notice.direct_message(result.data[direct_messages].id_str);
          }
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
  
  // Verify users account credentials
  my.verify_credentials = function(options) {
    if (my.current_requests.verify_credentials) {
      return false;
    }   var callback = function(result) {
      if (200 == result.status && result.data){
        localStorage.user = JSON.stringify(result.data);
        d = new Date();
        localStorage.user_touched = Math.floor(d.getTime() / 1000);
        if (Location.enabled && !result.data.geo_enabled) {
          Notice.show_info_bar('Location is currently disabled in your <a target="_blank" href="https://twitter.com/settings/account">Twitter settings</a>. If you would like to use location features be sure to enable it.')
        }
      }
      my.current_requests.verify_credentials = false;
      console.log('Verified account credentials :)');
    };
    // Make request to Twitter for direct messages.
    Twitter.get('account/verify_credentials', callback);
  }
  
  // Get single status
  my.status = function(id, options) {
    if (my.current_requests.status) {
      return false;
    }
    var callback = function(result) {
      if (200 == result.status && result.data){
        Status.save(result.data);
      }
      my.current_requests.status = false;
      console.log('Pulled new status :)');
    };
    var parameters = {};
    // Make request to Twitter for mentions.
    Twitter.get('statuses/show/' + id, callback, parameters);
  }
  
  // Get single status
  my.update = function(status, options) {
    if (my.current_requests.status) {
      return false;
    }
    // Callback to show a desktop notification when a status is created.
    var callback = function(result) {
      if (200 == result.status){
        Status.save(result.data);
        Notice.status(result.data.id_str);
        console.log('Tweet posted :)');
      } else {
        Notice.error('Grrr... Something went wrong. #fail!', result.data.error)
      }
    }
    // Text parameter for new status.
    var parameters = {
        status: status
    }
    // Attached place if requested.
    if(options && options.place_id) { 
      parameters.place_id = options.place_id;
    }
    // Post status to Twitter.
    Twitter.post('statuses/update', callback, parameters);
  }
  
  // Send a direct message
  my.message = function(screen_name, text) {
    // Callback to show a desktop notification when a message is created.
    var callback = function(result) {
      if (200 == result.status){
        DirectMessage.save(result.data);
        Notice.direct_message(result.data.id_str);
        console.log('Message sent :)');
      } else {
        Notice.error('Grrr... Something went wrong. #fail!', result.data.error)
      }
    }
    // Text and recepient parameter for message.
    var parameters = {
        screen_name: screen_name,
        text: text
    }
    // Post message to Twitter.
    Twitter.post('direct_messages/new', callback, parameters);
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