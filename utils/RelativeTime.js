const UNITS = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
}

const DEFAULTS = {
    locale: 'en',
    options: { numeric: 'auto' }
}

function RelativeTime (settings) {
    settings = settings || {}
    settings = {
      locale: settings.locale || DEFAULTS.locale,
      options: {...DEFAULTS.options, ...settings.options}
    }

    this.rtf = new Intl.RelativeTimeFormat(settings.locale, settings.options)
}


RelativeTime.prototype = {
    from(d1, d2){
      const elapsed = d1 - (d2 || new Date())
      for (let u in UNITS) {
        if (Math.abs(elapsed) > UNITS[u] || u == 'second') {
            return this.rtf.format(Math.round(elapsed/UNITS[u]), u)
        }
      }
    }
}

module.exports = RelativeTime;