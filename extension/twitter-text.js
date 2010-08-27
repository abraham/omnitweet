var TwitterText = (function () { 
    var my = {};
    var regexes = {};
    var punct = "!'#%&'()*+,\\-./:;<=>?@\\[/\\]^_{|}~";
    regexes['spaces'] = new RegExp("\\s");
    regexes['at_signs'] = new RegExp("[@＠]");
    regexes['extract_mentions'] = new RegExp("(^|[^a-zA-Z0-9_])" + regexes['at_signs'].source + "([a-zA-Z0-9_]{1,20})(?=(.|$))", "g");
    regexes['extract_reply'] = new RegExp("^(?:" + regexes['spaces'].source + ")*" + regexes['at_signs'].source + "([a-zA-Z0-9_]{1,20})", "g");
    regexes['list_name'] = /^[a-zA-Z\x80-\xff].{0,79}$/;
    var latin_accents = "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþ\\303\\277";
    var hashtag_charactars = "[a-z0-9_"+latin_accents+"]";
    regexes['auto_link_hashtags'] = new RegExp("(^|[^0-9A-Z&\\/]+)(#|＃)([0-9A-Z_]*[A-Z_]+" + hashtag_charactars + "*)", "ig");
    regexes['auto_link_usernames_or_lists'] = /([^a-zA-Z0-9_]|^)([@＠]+)([a-zA-Z0-9_]{1,20})(\/[a-zA-Z][a-zA-Z0-9\x80-\xff\-]{0,79})?/;
    regexes['auto_link_emoticon'] = /(8\-\#|8\-E|\+\-\(|\`\@|\`O|\&lt;\|:~\(|\}:o\{|:\-\[|\&gt;o\&lt;|X\-\/|\[:-\]\-I\-|\/\/\/\/Ö\\\\\\\\|\(\|:\|\/\)|∑:\*\)|\( \| \))/;
        
    regexes['valid_preceding_chars'] = new RegExp("(?:[^\\/\"':!=]|^|\\:)", "ig");
    regexes['valid_domain'] = new RegExp("(?:[^" + punct + "\\s][.-](?=[^" + punct + "\\s])|[^" + punct + "\\s]){1,}\\.[a-z]{2,}(?::[0-9]+)?", "ig");
    regexes['valid_url_path_chars']         = new RegExp("(?:[.,]?[a-z0-9!*'();:=+$/%#\\[\\]\\-_,~@])", "ig");
    regexes['valid_url_path_ending_chars']  = new RegExp("[a-z0-9)=#/]", "ig");
    regexes['valid_url_query_chars']        = new RegExp("[a-z0-9!*'();:&=+$/%#\\[\\]\\-_.,~]", "ig");
    regexes['valid_url_query_ending_chars'] = new RegExp("[a-z0-9_&=#]", "ig");
    
    var valid_url = "( \
      (" + regexes['valid_preceding_chars'].source + ") \
      ( \
        (https?:\\/\\/|www\\.) \
        (" + regexes['valid_domain'].source + ") \
        (/" + regexes['valid_url_path_chars'].source + "*" + regexes['valid_url_path_ending_chars'].source + "?)? \
        (\\?" + regexes['valid_url_query_chars'].source + "*" + regexes['valid_url_query_ending_chars'].source + ")? \
        ) \
    )";
    
    regexes['valid_url'] = new RegExp(valid_url.replace(/[\s]/g,''), "gi");
    
    var www_regex = /www\./i;

    // Default CSS class for auto-linked URLs
    var default_url_class = "tweet-url";
    // # Default CSS class for auto-linked lists (along with the url class)
    var default_list_class = "list-slug";
    // # Default CSS class for auto-linked usernames (along with the url class)
    var default_username_class = "username";
    // # Default CSS class for auto-linked hashtags (along with the url class)
    var default_hashtag_class = "hashtag";
    // # HTML attribute for robot nofollow behavior (default)
    var html_attr_no_follow = " rel=\"nofollow\"";

    // turns an "options" object into an html attributes string
    var tag_options = function(opt){
      var result = "";
      for (attr in opt){
        if(opt[attr]){
          result += " " + attr + "=\"" + opt[attr] +"\"";
        }
      }
      return result;
    }
    
    // creates and returns a copy of the opt object
    var copy_options = function(opt){
      var options = {};
      for (key in opt){
        options[key] = opt[key];
      }
      
      return options;
    }
    
    
    //  Add <a></a> tags around the usernames, lists, hashtags and URLs in the provided text. The
    //  <a> tags can be controlled with the following entries in the options
    //  hash:
    // 
    //  :url_class::     class to add to all <a> tags
    //  :list_class::    class to add to list <a> tags
    //  :username_class::    class to add to username <a> tags
    //  :hashtag_class::    class to add to hashtag <a> tags
    //  :username_url_base::      the value for href attribute on username links. The @username (minus the @) will be appended at the end of this.
    //  :list_url_base::      the value for href attribute on list links. The @username/list (minus the @) will be appended at the end of this.
    //  :hashtag_url_base::      the value for href attribute on hashtag links. The #hashtag (minus the #) will be appended at the end of this.
    //  :suppress_lists::    disable auto-linking to lists
    //  :suppress_no_follow::   Do not add rel="nofollow" to auto-linked items
    my.auto_link = function(text, options){
      return this.auto_link_usernames_or_lists(this.auto_link_urls_custom(this.auto_link_hashtags(text, options), options), options);
    }
    
    // Add <a></a> tags around the usernames and lists in the provided text. The
    // <a> tags can be controlled with the following entries in the options
    // hash:
    // 
    // :url_class::     class to add to all <a> tags
    // :list_class::    class to add to list <a> tags
    // :username_class::    class to add to username <a> tags
    // :username_url_base::      the value for href attribute on username links. The @username (minus the @) will be appended at the end of this.
    // :list_url_base::      the value for href attribute on list links. The @username/list (minus the @) will be appended at the end of this.
    // :suppress_lists::    disable auto-linking to lists
    // :suppress_no_follow::   Do not add rel="nofollow" to auto-linked items
    my.auto_link_usernames_or_lists = function(text, opt, func){
      options = copy_options(opt);
      options['url_class'] = options['url_class'] || default_url_class;
      options['list_class'] = options['list_class'] || default_list_class;
      options['username_class'] = options['username_class'] || default_username_class;
      options['username_url_base'] = options['username_url_base'] || "http://twitter.com/";
      options['list_url_base'] = options['list_url_base'] || "http://twitter.com/";
      
      var extra_html = "";
      
      if(!options['suppress_no_follow']){ extra_html = html_attr_no_follow; }
      
      var r = text.replace(regexes['auto_link_usernames_or_lists'], function(str, p1, p2, p3, p4, offset, s){
        
        if(p4 && !options['suppress_lists']){
          // # the link is a list
          var t = p3 + p4;
          var list = t;
          
          if(func){ t = func(list); }
          
          return p1 + p2 + "<a class=\"" + options['url_class'] + " " + options['list_class'] + "\" href=\"" + options['list_url_base'] + list + "\"" + extra_html + ">" + t + "</a>";
        }else {
          // # this is a screen name
          var t = p3;
          
          if(func){ t = func(text); }
          return p1 + p2 + "<a class=\"" + options['url_class'] + " " + options['username_class'] + "\" href=\"" + options['username_url_base'] + t + "\"" + extra_html + ">" + t + "</a>";       
        }

      });
      return r;
    }
    
    my.auto_link_urls_custom = function(text, opt){
      var options = copy_options(opt);
      
      if(!options['suppress_no_follow']){
        options['rel'] = "nofollow";
      }else{
        options['suppress_no_follow'] = null;
      }

      var r = text.replace(regexes['valid_url'], function(str, all, before, url, protocol, p4, offset, s){
        var html_attrs = tag_options(options);
        var full_url;
        
        if(protocol.match(www_regex)){
          full_url = "http://" + url
        }else{
          full_url = url;
        }

        return before + "<a href=\"" + full_url + "\"" + html_attrs + ">" + url + "</a>";
      });
      
      return r;
    }
    
    my.auto_link_hashtags = function(text, opt, func){
      var options = copy_options(opt);
      
      options['url_class'] = options['url_class'] || default_url_class;
      options['hashtag_class'] = options['hashtag_class'] || default_hashtag_class;
      options['hashtag_url_base'] = options['hashtag_url_base'] || "http://twitter.com/search?q=%23";
      
      var extra_html = "";
      if(!options['suppress_no_follow']){
        extra_html = html_attr_no_follow;
      }
    

      var r = text.replace(regexes['auto_link_hashtags'], function(str, before, hash, text, offset, s){
        if(func){ text = func(text); }
        return before + "<a href=\"" + options['hashtag_url_base'] + text + "\" title=\"#" + text + "\" class=\"" + options['url_class'] + " " + options['hashtag_class'] + "\"" + extra_html + ">" + hash + text +"</a>";
      });
      
      return r;
    }
    
    // Extracts a list of all usernames mentioned in the Tweet <tt>text</tt>. If the
    // <tt>text</tt> is <tt>nil</tt> or contains no username mentions an empty array
    // will be returned.
    //
    // If a block is given then it will be called for each username.
    my.extract_mentioned_screen_names = function(text, func){
      if(!text){ return []; }

      var possible_screen_names = [];
      
      text.replace(regexes['extract_mentions'], function(str, before, sn, after, offset){
        if(!after.match(regexes['at_signs'])){
          possible_screen_names.push(sn)
        }    
      });
      
      if(func){
        for (var i=0; i < possible_screen_names.length; i++) {
          func(possible_screen_names[i])
        };
      }

      return possible_screen_names;
    }

    // Extracts the username username replied to in the Tweet <tt>text</tt>. If the
    // <tt>text</tt> is <tt>nil</tt> or is not a reply nil will be returned.
    //
    // If a block is given then it will be called with the username replied to (if any)
    my.extract_reply_screen_name = function(text, func){
      if(!text) { return null };
      var screen_name = null;
      text.replace(regexes['extract_reply'], function(str, username, offset){
        screen_name = username;
        if(func) { func(screen_name); }
      });

      return screen_name;
    }
    // 
    // # Extracts a list of all URLs included in the Tweet <tt>text</tt>. If the
    // # <tt>text</tt> is <tt>nil</tt> or contains no URLs an empty array
    // # will be returned.
    // #
    // # If a block is given then it will be called for each URL.
    my.extract_urls = function(text, func){
      if(!text){ return []; }
      var urls = []
      
      text.replace(regexes['valid_url'], function(str, all, before, url, protocol, p4, offset, s){
        var full_url;
        
        if(protocol.match(www_regex)){
          full_url = "http://" + url
        }else{
          full_url = url;
        }
        urls.push(full_url)
      });
      
      if(func) {
        for (var i=0; i < urls.length; i++) {
          func(urls[i]);
        };
      }
      
      return urls;
    }
    // 
    // # Extracts a list of all hashtags included in the Tweet <tt>text</tt>. If the
    // # <tt>text</tt> is <tt>nil</tt> or contains no hashtags an empty array
    // # will be returned. The array returned will not include the leading <tt>#</tt>
    // # character.
    // #
    // # If a block is given then it will be called for each hashtag.
    my.extract_hashtags = function(text, func){
      if(!text){ return []; }
      var tags = []
      
      text.replace(regexes['auto_link_hashtags'], function(str, before, hash, hash_text){
        tags.push(hash_text)
      }) 
      
      if(func) {
        for (var i=0; i < tags.length; i++) {
          func(tags[i]);
        };
      }

      return tags;
    }

    my.printUnicodeSpaces = function () { 
      console.log(this.unicode_spaces);
    }; 
    
    my.regexes = regexes;
     
    return my; 
}());
