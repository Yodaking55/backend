module.exports.sendEmail = function (to, sub, msg) {
  var from = global.env.mailgun.MAILGUN_FROM;
  var api_key = global.env.mailgun.MAILGUN_API_KEY;
  var domain = global.env.mailgun.MAILGUN_DOMAIN;
  var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });

  var data = {
    from: from,
    to: to,
    subject: sub,
    html: msg
  };

  mailgun.messages().send(data, function (error, body) {
    if (error) {
      console.log('Mail gun error', error);
      return true;
    } else {
      console.log('Mail gun send mesg success', body);
      return true;
    }
  });
}