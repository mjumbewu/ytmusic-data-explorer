async function init_gapi_client() {
  gapi.client.setApiKey('AIzaSyBMtW2xRRr-2N8pqtXvEYrc5uUNG29c2ec')

  await gapi.client.init({
    // // clientId and scope are optional if auth is not required.
    // 'clientId': 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    // 'scope': 'profile',
  })

  try {
    await gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    console.log("GAPI client loaded for API")
  } catch (err) {
    console.error("Error loading GAPI client for API", err)
  }
}

gapi.load('client', init_gapi_client);
