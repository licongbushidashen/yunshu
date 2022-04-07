var host = window.location.protocol + '//' + window.location.host;
var oauthHost = window.location.protocol + '//' + window.location.host;

window.config = {
  oauthHost: oauthHost + '/api',
  redirectHost: host,
  client_id: 'api',
  scope: 'read',
  secret: 'c31b32364ce19ca8fcd150a417ecce58',
  apiHost: host + '/api',
  portalHost: host,
};
