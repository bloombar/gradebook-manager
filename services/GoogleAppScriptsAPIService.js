const fs = require("fs").promises
const readline = require("readline")
const { google } = require("googleapis")

// a class to handle sending email
function GoogleAppScriptsAPIService(config) {
  this.auth = null // will hold an authorized OAuth2 client.

  /**
   * Runs a function in a deployed Apps Script
   * @param {Object} parameters the script details: scriptId, function name to run and function parameters
   */
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

  /**
   * Creates a new script project, upload a file, and log the script's URL.
   * @param {Object} parameters The source file path and manifest file path for the script to deploy
   */
  this.deploy = async ({ scriptSourceFilePath, scriptManifestFilePath }) => {
    // create new script
    const script = google.script({ version: "v1", auth: this.auth })
    // let res = script.projects.get(process.env.gcpProjectId)

    let res = await script.projects
      .create({
        resource: {
          title: "Get Quiz Grades",
        },
      })
      .catch(err =>
        console.log(`The API create method returned an error: ${err}`)
      )

    // save the id
    const scriptId = res.data.scriptId

    // read the target script file
    const deployScriptSource = await fs.readFile(scriptSourceFilePath, "utf8")

    // read the target script manifestFile
    const deployScriptManifest = await fs.readFile(
      scriptManifestFilePath,
      "utf8"
    )

    // upload it
    res = await script.projects
      .updateContent(
        {
          auth: this.auth,
          scriptId,
          resource: {
            files: [
              {
                name: "target_script",
                type: "SERVER_JS",
                source: deployScriptSource,
              },
              {
                name: "appsscript",
                type: "JSON",
                source: deployScriptManifest,
              },
            ],
          },
        },
        {}
      )
      .catch(err =>
        console.log(`The API updateContent method returned an error: ${err}`)
      )

    // upload success
    // console.log(`https://script.google.com/d/${res.data.scriptId}/edit`)

    return scriptId
  }

  /**
   * Authorizes the oAuth2Client connection by calling the authorize method and passing the client credentials.
   */
  this.connect = async () => {
    // Load client secrets from a local file.
    const content = await fs
      .readFile(config.credentialsPath)
      .catch(err => console.log("Error loading client secret file:", err))
    // Authorize a client with credentials
    const auth = await this.authorize(JSON.parse(content))
    this.auth = auth // store it internally
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
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    )
    // Check if we have previously stored a token.
    const token = await fs
      .readFile(config.tokenPath)
      .catch(err => this.getAccessToken(oAuth2Client))
    oAuth2Client.setCredentials(JSON.parse(token))
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
