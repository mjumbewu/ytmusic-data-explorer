var iso8601DurationRegex = /(-)?P(?:([.,\d]+)Y)?(?:([.,\d]+)M)?(?:([.,\d]+)W)?(?:([.,\d]+)D)?T(?:([.,\d]+)H)?(?:([.,\d]+)M)?(?:([.,\d]+)S)?/;

function parseISO8601Duration(iso8601Duration) {
    var matches = iso8601Duration.match(iso8601DurationRegex);

    return {
        sign: matches[1] === undefined ? '+' : '-',
        years: matches[2] === undefined ? 0 : matches[2],
        months: matches[3] === undefined ? 0 : matches[3],
        weeks: matches[4] === undefined ? 0 : matches[4],
        days: matches[5] === undefined ? 0 : matches[5],
        hours: matches[6] === undefined ? 0 : matches[6],
        minutes: matches[7] === undefined ? 0 : matches[7],
        seconds: matches[8] === undefined ? 0 : matches[8]
    };
};

class YTMTakeoutData {
  constructor(raw_data) {
    this.raw_data = raw_data
  }

  get ytm_data() {
    return this.raw_data.filter(event => event.header == 'YouTube Music')
  }

  async hydrate() {
    const ids = [...new Set(
      this.ytm_data
      .map(event => this.extractMediaIdFromEvent(event))
      .filter(id => !!id)
    )]

    let hydrationPromises = []
    this.supp_data = {}
    for (let i = 0; i < ids.length; i += 50) {
      const ids_subset = ids.slice(i, i + 50)
      let p = gapi.client.youtube.videos.list({
        "part": [
          "contentDetails,statistics"
        ],
        "id": [
          ids_subset.join(',')
        ]
      }).then(
        response => {
          for (const item of response.result.items) {
            this.supp_data[item.id] = item
          }
          
          let dataChangedEvent = new Event('data-changed');
          window.dispatchEvent(dataChangedEvent)
        },
        reason => {
          console.log(`Failed to hydrate for the following ids because "${reason}":`)
          console.log(ids_subset)
        }
      )

      hydrationPromises.push(p)
    }

    for (const p of hydrationPromises) {
      await p
    }
    // const supplemental_data = response.result
  }

  extractArtistNameFromEvent(event) {
    const artist_suffix = ' - Topic'
    for (const subtitle of (event.subtitles || [])) {
      if (subtitle.name.endsWith(artist_suffix)) {
        return subtitle.name.slice(0, -artist_suffix.length)
      }
    }
  }

  extractSongTitleFromEvent(event) {
    const title_prefix = 'Watched '
    return event.title.slice(title_prefix.length)
  }

  extractUrlFromEvent(event) {
    return event.titleUrl
  }

  extractMediaIdFromEvent(event) {
    const id_prefix = 'https://www.youtube.com/watch?v='
    const url = this.extractUrlFromEvent(event)
    if (url) {
      return url.slice(id_prefix.length)
    }
  }

  artists() {
    let artists = {}
    for (const event of this.ytm_data) {
      for (const subtitle of (event.subtitles || [])) {
        const name = this.extractArtistNameFromEvent(event)
        if (!name) { continue }

        const id = this.extractMediaIdFromEvent(event)
        const suppData = this.supp_data[id]
        artists[name] ||= {name, playCount: 0, playTime: suppData ? 0 : null}
        artists[name].playCount += 1

        if (suppData) {
          const dur = parseISO8601Duration(suppData.contentDetails.duration)
          artists[name].playTime += dur.hours + (dur.minutes / 60.0) + (dur.seconds / 3600.0)
        }
      }
    }
    return Object.values(artists)
  }

  songs() {
    let songs = {}
    for (const event of this.ytm_data) {
      const title = this.extractSongTitleFromEvent(event)
      const artistName = this.extractArtistNameFromEvent(event) || '-'
      const id = this.extractMediaIdFromEvent(event)
      const suppData = this.supp_data[id]

      const songKey = `${title} ; ${artistName}`
      songs[songKey] ||= {title, artistName, playCount: 0, playTime: suppData ? 0 : null}
      songs[songKey].playCount += 1

      if (suppData) {
        const dur = parseISO8601Duration(suppData.contentDetails.duration)
        songs[songKey].playTime += dur.hours + (dur.minutes / 60.0) + (dur.seconds / 3600.0)
      }
    }
    return Object.values(songs)
  }
}

async function loadDataFromText(text) {
  const loadedData = JSON.parse(text)
  let fancyData = new YTMTakeoutData(loadedData)
  fancyData.hydrate()
  return fancyData
}

async function loadDataFromFile(file) {
  let loadedText = await file.text()
  return await loadDataFromText(loadedText)
}

async function loadDataFromForm(form) {
  const fileInput = form.querySelector('input[type=file]')
  if (fileInput.files.length < 1) {
    throw 'No files were selected'
  }

  let loadedDatas = []
  for (const file of fileInput.files) {
    loadedDatas.push(await loadDataFromFile(file))
  }
  return loadedDatas
}

export {
  loadDataFromForm
}
