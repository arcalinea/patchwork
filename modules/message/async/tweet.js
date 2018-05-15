var h = require('mutant/h')
var nest = require('depnest')
var twit = require('twit');

var config = require('../../../config.js');

exports.needs = nest({
  'sheet.display': 'first',
  'message.html.render': 'first',
  'keys.sync.id': 'first',
  'intl.sync.i18n': 'first'
})

exports.gives = nest('message.async.tweet')

exports.create = function (api) {
  const i18n = api.intl.sync.i18n
  const Twitter = new twit(config);

  return nest('message.async.tweet', function (content, cb) {
    api.sheet.display(function (close) {
        return {
          content: [
            api.message.html.render({value: {
              content,
              private: !!content.recps,
              author: api.keys.sync.id()
            }})
          ],
          footer: [
            h('button -save', { 'ev-click': tweet }, i18n('Confirm Tweet')),
            h('button -cancel', { 'ev-click': cancel }, i18n('Cancel'))
          ]
        }
        
      function tweet () {
        close()
        Twitter.post('statuses/update', { status: content.text }, function(err, data, response) {
          if (err) {
              console.log("Error tweeting:", err)
              cb(err, null)
          } else {
              console.log("Tweet text:", data.text)
              cb(null, data.text)
          }
        })
      }

      function cancel () {
        close()
        cb && cb(null, false)
      }
    })
    return true
  })
}
