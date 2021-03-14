# Copy Quiz Grades from a Google Form to a Google Sheet

This project will copy grades from a quiz created in Google Forms to a specific column in a Google Sheet. This is intended to be used for copying Google Forms quiz grades into a class gradebook.

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

### Run the project

Run `node .` to start this project. A URL will be output the first time you run it

1. visit this URL in your web browser and authenticate the app. A code will be displayed.
1. copy and paste this code into the command line. The app will then generate a file named `token.json` which will be reused to authenticate the app on all subsequent executions.

The first time you run the app, you may receive an error `User has not enabled the Apps Script API.`, with a URL to follow to enable the API. Visit that link in your browser and enable the API there.
