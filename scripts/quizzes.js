/**
 * Retrieve a CSV-formatted list of grades from the given Google Forms Quiz.
 * @param {*} quizId The Google Drive ID of the quiz
 */
const getQuizGrades = quizId => {
  // get access to the form
  const form = FormApp.openById(quizId)
  Logger.log("Published URL: " + form.getPublishedUrl())
  Logger.log("Editor URL: " + form.getEditUrl())

  // an array to hold grades
  let grades = []

  // get the submissions with most recent first
  const responses = form.getResponses().reverse()

  // iterate through each submission
  responses.forEach(response => {
    const email = response.getRespondentEmail() // the respondent's email address
    const timestamp = response.getTimestamp()
    let totalScore = 0 // total score on the quiz
    let totalAvailableScore = 0 // total available points on the quiz
    // get individual question items from this response
    const items = response.getItemResponses()
    // iterate through individual responses
    items.forEach(item => {
      const gradableResponseForItem = response.getGradableResponseForItem(
        item.getItem()
      ) // a version with the score included
      const pointableItem = castQuizItem(item.getItem()) // a version cast to the appropriate question type, with points included
      // the point value of this question
      const points = pointableItem.getPoints()
      totalAvailableScore += points
      // the score the respondent received for this question
      const score = gradableResponseForItem.getScore()
      totalScore += score // update total
      // Logger.log(`Question: "${item.getItem().getTitle()}; Response: ${item.getResponse()}"`)
    })
    // determine total score
    const percentScore = parseInt((100 * totalScore) / totalAvailableScore)
    Logger.log(
      `${email} total score: ${totalScore} out of ${totalAvailableScore} (${percentScore}%)`
    )
    // add to array
    grades.push({
      email,
      timestamp,
      totalScore,
      totalAvailableScore,
      percentScore,
    })
  }) // foreach response

  return grades
}

const castQuizItem = item => {
  const itemType = item.getType()
  if (itemType === FormApp.ItemType.CHECKBOX) {
    return item.asCheckboxItem()
  }
  if (itemType === FormApp.ItemType.DATE) {
    return item.asDateItem()
  }
  if (itemType === FormApp.ItemType.DATETIME) {
    return item.asDateTimeItem()
  }
  if (itemType === FormApp.ItemType.DURATION) {
    return item.asDurationItem()
  }
  if (itemType === FormApp.ItemType.LIST) {
    return item.asListItem()
  }
  if (itemType === FormApp.ItemType.MULTIPLE_CHOICE) {
    return item.asMultipleChoiceItem()
  }
  if (itemType === FormApp.ItemType.PARAGRAPH_TEXT) {
    return item.asParagraphTextItem()
  }
  if (itemType === FormApp.ItemType.SCALE) {
    return item.asScaleItem()
  }
  if (itemType === FormApp.ItemType.TEXT) {
    return item.asTextItem()
  }
  if (itemType === FormApp.ItemType.TIME) {
    return item.asTimeItem()
  }
  if (itemType === FormApp.ItemType.GRID) {
    return item.asGridItem()
  }
  if (itemType === FormApp.ItemType.CHECKBOX_GRID) {
    return item.asCheckboxGridItem()
  }
  if (itemType === FormApp.ItemType.PAGE_BREAK) {
    return item.asPageBreakItem()
  }
  if (itemType === FormApp.ItemType.SECTION_HEADER) {
    return item.asSectionHeaderItem()
  }
  if (itemType === FormApp.ItemType.VIDEO) {
    return item.asVideoItem()
  }
  if (itemType === FormApp.ItemType.IMAGE) {
    return item.asImageItem()
  }
  return null
}
