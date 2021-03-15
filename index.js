const { google } = require("googleapis")
require("dotenv").config() // for those pesky environmental variables
const fs = require("fs").promises // a promisified file reader
const argv = require("yargs/yargs")(process.argv.slice(2)).argv // for parsing command line arguments

// load the custom google app scripts service to handle basic tasks
const {
  GoogleAppScriptsAPIService,
} = require("./services/GoogleAppScriptsAPIService")

main()

async function main() {
  // connect to google apps script api
  const gass = new GoogleAppScriptsAPIService({
    // If modifying these scopes, delete token.json.
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    scopes: [
      "https://www.googleapis.com/auth/script.projects",
      "https://www.googleapis.com/auth/script.deployments",
      "https://www.googleapis.com/auth/script.scriptapp",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/forms",
    ],
    credentialsPath: "./credentials/credentials.json",
    tokenPath: "./credentials/token.json",
  })
  await gass.connect()

  // determine what to do based on command line arguments
  if (argv._ == "deploy") {
    console.log(`deploying ${argv.script}...`)
    // deploy a script with the supplied source and manifest files
    const scriptId = await deploy(auth, {
      scriptSourceFilePath:
        argv.script || process.env.DEFAULT_SCRIPT_SOURCE_FILE,
      scriptManifestFilePath:
        argv.manifest || process.env.DEFAULT_SCRIPT_MANIFEST_FILE,
    })
    console.log(`Script deployed: https://script.google.com/d/${scriptId}/edit`)
  } else if (argv._ == "run") {
    // run a script with the supplied id
    console.log(`running script ${argv.scriptId}...`)
    const res = await gass.run({
      scriptId: argv.scriptId || process.env.DEFAULT_SCRIPT_ID, // either a supplied script id or the default one
      functionName: argv.function || process.env.DEFAULT_SCRIPT_FUNCTION_NAME,
      parameters: [argv.quizId || process.env.DEFAULT_QUIZ_ID],
    })

    // output the results as csv
    console.log(`email,total_score,total_points_available,total_score_percent`)

    res.response.result.forEach(result => {
      // output the grade for each result
      console.log(
        `${result.email},${result.totalScore},${result.totalAvailableScore},${result.percentScore}`
      )
    })
  }
}
