const fs = require("fs")
const readline = require("readline")
const { google } = require("googleapis")

// a class to handle sending email
function GoogleAppScriptsAPIService(config) {
  this.connect = ({ callback }) => {
    // Load client secrets from a local file.
    fs.readFile(config.credentialsPath, (err, content) => {
      if (err) return console.log("Error loading client secret file:", err)
      // Authorize a client with credentials, then call the Google Apps Script API.
      this.authorize(JSON.parse(content), callback)
    })
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  this.authorize = (credentials, callback) => {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    )

    // Check if we have previously stored a token.
    fs.readFile(config.tokenPath, (err, token) => {
      if (err) return this.getAccessToken(oAuth2Client, callback)
      oAuth2Client.setCredentials(JSON.parse(token))
      callback(oAuth2Client)
    })
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  this.getAccessToken = (oAuth2Client, callback) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: config.scopes,
    })
    console.log("Authorize this app by visiting this url:", authUrl)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question("Enter the code from that page here: ", code => {
      rl.close()
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error("Error retrieving access token", err)
        oAuth2Client.setCredentials(token)
        // Store the token to disk for later program executions
        fs.writeFile(config.tokenPath, JSON.stringify(token), err => {
          if (err) return console.error(err)
          console.log("Token stored to", config.tokenPath)
        })
        callback(oAuth2Client)
      })
    })
  }
} // GoogleAppScriptsAPIService

module.exports = {
  GoogleAppScriptsAPIService,
}
