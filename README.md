# Deploy and execute Google Apps Scripts

This project contains instructions and code for deploying and executing Google Apps Scripts intended to manage grades kept in Google Forms Quizzes and Google Sheets gradebooks.

The default scripts in this project will pull grades from any Quiz created in Google Forms and enter those grades into a specific column in gradebook created as a Google Sheet. Google Form Quiz grades are correlated with rows in the Google Sheet based on a common email addresses.

## Setup instructions

### Create a Google Cloud Project

Go to the [Google Cloud Platform console](https://console.cloud.google.com/) and create a new project.

### Enable Google Apps Script API

In your project's API's section, [enable Google Apps Script API](https://developers.google.com/apps-script/api/quickstart/nodejs). This will allow you to run scripts on Google Forms and other Google Apps.

### Set up your project's OAuth Consent Screen

Before you can create OAuth credentials that will allow the script to run in your account, you must set up an OAuth Consent Screen... follow the instructions.

### Create OAuth credentials

Go to your project's API credentials section, and click to create new `OAuth client ID` credentials.

- when asked for `Application type`, enter `Desktop app`.

Once OAuth credentials have been generated, you will see a link to download them. Save them into a file named `credentials.json` in the project folder.

## Deploy a script

### Deploy the default script

Run `node . deploy` to start this project with the default script and manifest files, located in the [scripts](./scripts/) sub-directory.

A URL will be output the first time you run it.

1. visit this URL in your web browser and authenticate the app. A code will be displayed.
1. copy and paste this code into the command line. The app will then generate a file named `token.json` which will be reused to authenticate the app on all subsequent executions.

The first time you run the app, you may receive an error `User has not enabled the Apps Script API.`, with a URL to follow to enable the API. Visit that link in your browser and enable the API there.

### Deploy a custom script

Run `node . deploy --script <script_file_path> --manifest <manifest_file_path>` to deploy a custom script, where `<script_file_path>` and `<manifest_file_path>` are replaced with actual file paths of the script and manifest files, respectively.

## Execute a deployed script

### Execute the default script with the default Google Forms Quiz

The `example.env` file contains an example of the data that should be placed in a file named `.env`. This file contains default settings, including the default script to execute, and the default Google Forms Quiz from which to retrieve grades.

Execute using these defaults with

```bash
node . run
```

### Execute the default script with a custom Google Forms Quiz

To execute the default script with a custom Google Forms Quiz, replace `<quiz_id>` with the id of your own Google Forms Quiz. The id is most easily accessed by copying it from the URL of the Google Form in a web browser.

```bash
node . run --quizId <quiz_id>
```

### Execute a custom script

To execute a custom script, replace `<script_id>` with the unique identifier of the deployed Google Apps Script with the code you wish to execute and `<function_name>` with the name of the function within the script to run.

```bash
node . run --scriptId <script_id> --function <function_name>
```

... or, if your custom script interacts with a Google Forms Quiz, indicate the `<quiz_id>`:

```bash
node . run --scriptId <script_id> --function <function_name> --quizId <quiz_id>
```
