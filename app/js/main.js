import { loadDataFromForm } from './ytm_data.js'
import { updateUI } from './ui.js'

window.state = {
  data: [],
  sortArtistsBy: 'play count',
  sortSongsBy: 'play count',
}

async function onSubmitDataLoader(evt) {
  evt.preventDefault()
  const loadedDatas = await loadDataFromForm(this)
  state.data.push(...loadedDatas)
  await updateUI(state)
}

async function onDataChanged(evt) {
  await updateUI(state)
}

let uiDataLoader = document.querySelector('#uiDataLoader')
uiDataLoader.querySelector('form').addEventListener('submit', onSubmitDataLoader)

window.addEventListener('data-changed', onDataChanged)
