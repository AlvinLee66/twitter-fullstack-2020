const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
const zhTw = require('dayjs/locale/zh-tw')

dayjs.extend(relativeTime)
dayjs.locale(zhTw)

module.exports = {
  currentYear: () => dayjs().year(),
  relativeTimeFromNow: a => dayjs(a).locale(zhTw).fromNow(12),
  ifCond: function (a, b, options) {
    return a === b ? options.fn(this) : options.inverse(this)
  }
}
