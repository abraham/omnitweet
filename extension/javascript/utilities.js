// Count characters and count each URL as 20 characters to match what t.co will be.
function countCharacters(string) {
  count = string.length;
  urls = TwitterText.extract_urls(string);
  if (urls.length != 0) {
    for (var url in urls) {
      count = count + (20 - urls[url].length);
    }
  }
  return count;
}