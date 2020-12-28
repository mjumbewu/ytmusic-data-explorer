import { loadDataFromForm } from './ytm_data.js'
import { initGapiClient } from './ytm_auth.js'
import { updateUI } from './ui.js'

gapi.load('client', initGapiClient);

window.state = {
  data: [],
  sortArtistsBy: 'play count',
  sortSongsBy: 'play count',
}

async function onSubmitDataLoader(evt) {
  evt.preventDefault()
  const loadedDatas = await loadDataFromForm(this.form)
  state.data.push(...loadedDatas)
  await updateUI(state)
}

async function onDataChanged(evt) {
  await updateUI(state)
}

let uiDataLoader = document.querySelector('#uiDataLoaderFile')
uiDataLoader.addEventListener('change', onSubmitDataLoader)

window.addEventListener('data-changed', onDataChanged)
