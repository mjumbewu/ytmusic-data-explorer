function makeTemplateFunc(template) {
  return (params) => {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${template}\`;`)(...vals);
  }
}

let templates = {
  mostPlayedArtistsListItem: makeTemplateFunc(document.querySelector('#tmpMostPlayedArtistsListItem').innerHTML),
  mostPlayedSongsListItem: makeTemplateFunc(document.querySelector('#tmpMostPlayedSongsListItem').innerHTML),
}

async function updateUI(state) {
  if (state.data.length > 0) {
    document.querySelector('body').classList.add('data-loaded')
    renderMostPlayedArtists(state)
    renderMostPlayedSongs(state)
  }
}

function renderMostPlayedArtists(state) {
  const sortKeys = {
    'play count': (a1, a2) => a2.playCount - a1.playCount,
    'play time': (a1, a2) => a2.playTime - a1.playTime,
  }

  let newHTML = ''
  for (const data of state.data) {
    for (const artist of data.artists().sort(sortKeys[state.sortArtistsBy])) {
      newHTML += templates.mostPlayedArtistsListItem(artist)
    }
  }

  const mostPlayedArtistsList = document.querySelector('#uiMostPlayedArtistsList tbody')
  mostPlayedArtistsList.innerHTML = newHTML
}

function renderMostPlayedSongs(state) {
  const sortKeys = {
    'play count': (a1, a2) => a2.playCount - a1.playCount,
    'play time': (a1, a2) => a2.playTime - a1.playTime,
  }

  let newHTML = ''
  for (const data of state.data) {
    for (const song of data.songs().sort(sortKeys[state.sortSongsBy])) {
      newHTML += templates.mostPlayedSongsListItem(song)
    }
  }

  const mostPlayedSongsList = document.querySelector('#uiMostPlayedSongsList tbody')
  mostPlayedSongsList.innerHTML = newHTML
}

export {
  updateUI
}
