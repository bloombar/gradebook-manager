// a class to handle dealing with google sheets
function GoogleSheetsService(config) {
  this.letters = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z".split(
    " "
  )

  /**
   * Translates a two-dimensional array indices into spreadsheet-friendly A1 notation.
   * e.g. 2d array index 2, 3 (row, column array indices) would translate to C3 (column, row in A1 notation)
   */
  this.getA1Notation = (rowIndex, colIndex) => {
    const page = parseInt(colIndex / this.letters.length)
    const pageLetter = page > 0 ? this.letters[page - 1] : ""
    const colLetter = this.letters[colIndex % this.letters.length]
    const col = `${pageLetter}${colLetter}`
    const row = rowIndex + 1 // spreadsheet rows start from 1, arrays start from 0
    return `${col}${row}`
  }

  /**
   * Locate the ID, in A1 notation, of the cell in the given column for the row representing the student with the given email
   * @param {*} data Two-dimensional array of gradebook data
   * @param {*} email The email address of the student whose row to find
   * @param {*} colName The name of the column of interest
   */
  this.getCellId = (rows, email, colName) => {
    // iterate through the first few rows looking for the column name in all fields
    let colIndex = -1
    let maxHeaderRows = rows.length > 3 ? 3 : rows.length // assume column headers will be in no more than 3 rows
    for (let i = 0; i < maxHeaderRows; i++) {
      for (let j = 0; j < rows[i].length; j++) {
        if (rows[i][j].toLowerCase() == colName.toLowerCase()) {
          colIndex = j // found the column!
          break
        }
      }
    }
    if (colIndex < 0) throw `No column named ${colName}.`

    // iterate through all rows looking for this email address
    let rowIndex = -1
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].length; j++) {
        if (rows[i][j].toLowerCase() == email.toLowerCase()) {
          rowIndex = i // found the row!
          break
        }
      }
    }
    if (colIndex < 0) throw `No column named ${colName}.`

    return this.getA1Notation(rowIndex, colIndex)
  }
}

module.exports = {
  GoogleSheetsService,
}
