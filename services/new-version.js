const fs = require("fs").promises
const readline = require("readline")
const { google } = require("googleapis")

// a class to handle sending email
function GoogleAppScriptsAPIService(config) {
  this.auth = null

  this.run = async ({ scriptId, functionName, parameters }) => {
    // create new script
    const script = google.script({ version: "v1", auth: this.auth })

    // run it
    res = await script.scripts
      .run({
        auth: this.auth,
        scriptId,
        resource: {
          function: functionName,
          parameters: parameters,
          devMode: true,
        },
      })
      .catch(err => console.log(`The API run method returned an error: ${err}`))

    // console.log(res.data)

    return res.data
  }

  this.connect = async () => {
    // Load client secrets from a local file.
    const auth = await fs.readFile(
      config.credentialsPath,
      async (err, content) => {
        if (err) return console.log("Error loading client secret file:", err)
        // Authorize a client with credentials, then call the Google Apps Script API.
        return await this.authorize(JSON.parse(content))
      }
    )
    this.auth = auth //save the auth token
    return auth
  }

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  this.authorize = async credentials => {
    const { client_secret, client_id, redirect_uris } = credentials.installed
    let oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    )

    // Check if we have previously stored a token.
    oAuth2Client = await fs.readFile(config.tokenPath, (err, token) => {
      if (err) return this.getAccessToken(oAuth2Client, callback)
      oAuth2Client.setCredentials(JSON.parse(token))
      return oAuth2Client
    })
    return oAuth2Client
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  this.getAccessToken = async oAuth2Client => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: config.scopes,
    })
    console.log("Authorize this app by visiting this url:", authUrl)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    const auth = await rl.question(
      "Enter the code from that page here: ",
      async code => {
        rl.close()
        await oAuth2Client.getToken(code, async (err, token) => {
          if (err) return console.error("Error retrieving access token", err)
          oAuth2Client.setCredentials(token)
          // Store the token to disk for later program executions
          await fs.writeFile(config.tokenPath, JSON.stringify(token), err => {
            if (err) return console.error(err)
            console.log("Token stored to", config.tokenPath)
          })
        })
        return oAuth2Client
      }
    )
    return auth
  }
} // GoogleAppScriptsAPIService

module.exports = {
  GoogleAppScriptsAPIService,
}
