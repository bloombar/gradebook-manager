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

/**
 * Creates a new script project, upload a file, and log the script's URL.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function deploy(auth, { scriptSourceFilePath, scriptManifestFilePath }) {
  // create new script
  const script = google.script({ version: "v1", auth })
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
  const deployScriptManifest = await fs.readFile(scriptManifestFilePath, "utf8")

  // upload it
  res = await script.projects
    .updateContent(
      {
        auth,
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
