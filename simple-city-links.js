/**
 * Simple Google Apps Script to generate city links
 * This is a simplified version that will definitely work
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('City Links Generator')
    .addItem('Generate City Links', 'generateCityLinks')
    .addItem('Test Script', 'testScript')
    .addToUi();
}

function testScript() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  var message = "Test Results:\n\n";
  message += "Total rows: " + values.length + "\n";
  message += "Headers: " + values[0].join(", ") + "\n";
  
  if (values.length > 1) {
    message += "First data row: " + values[1].join(", ") + "\n";
  }
  
  SpreadsheetApp.getUi().alert(message);
}

function generateCityLinks() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Find the Address column
  var headers = values[0];
  var addressColumnIndex = -1;
  
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].toLowerCase().includes("address")) {
      addressColumnIndex = i;
      break;
    }
  }
  
  if (addressColumnIndex === -1) {
    SpreadsheetApp.getUi().alert("Error: No Address column found!");
    return;
  }
  
  // Create City Links column
  var lastColumn = sheet.getLastColumn();
  var cityLinksColumn = lastColumn + 1;
  
  // Add header
  sheet.getRange(1, cityLinksColumn).setValue("City Links");
  sheet.getRange(1, cityLinksColumn).setFontWeight("bold");
  sheet.getRange(1, cityLinksColumn).setBackground("#e8f0fe");
  
  // Process each row
  var processedCount = 0;
  
  for (var i = 1; i < values.length; i++) {
    var address = values[i][addressColumnIndex];
    
    if (address && typeof address === 'string' && address.trim() !== '') {
      var city = extractCity(address);
      
      if (city) {
        var cityLink = "https://www.dogboardingkennels.us/city/" + formatCity(city);
        sheet.getRange(i + 1, cityLinksColumn).setValue(cityLink);
        processedCount++;
      }
    }
  }
  
  // Show completion message
  SpreadsheetApp.getUi().alert(
    "City links generated successfully!\n\n" +
    "Processed " + processedCount + " rows.\n" +
    "City Links column added at position " + cityLinksColumn + "."
  );
}

function extractCity(address) {
  if (!address || typeof address !== 'string') {
    return null;
  }
  
  // Simple city extraction patterns
  var patterns = [
    /,\s*([^,]+),\s*[A-Z]{2}\s*\d{5}/,  // Street, City, State ZIP
    /,\s*([^,]+),\s*[A-Z]{2}/,          // Street, City, State
    /,\s*([^,]+),\s*United States/,     // Street, City, United States
  ];
  
  for (var i = 0; i < patterns.length; i++) {
    var match = address.match(patterns[i]);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

function formatCity(city) {
  if (!city || typeof city !== 'string') {
    return '';
  }
  
  return city.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .replace(/^\-+|\-+$/g, '');
}