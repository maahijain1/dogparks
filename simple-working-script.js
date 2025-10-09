/**
 * Simple Working Business Script
 * This script works without complex HTML formatting
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏢 Business Tools')
    .addItem('🔗 Generate City Links', 'generateCityLinks')
    .addItem('📧 Send Email Campaign', 'sendEmailCampaign')
    .addItem('🧪 Test Single Email', 'testSingleEmail')
    .addItem('🗑️ Remove Unnecessary Columns', 'removeUnnecessaryColumns')
    .addToUi();
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
    SpreadsheetApp.getUi().alert("❌ Error: No Address column found!");
    return;
  }
  
  // Check if City Links column already exists
  var cityLinksColumn = -1;
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].toLowerCase().includes("city link")) {
      cityLinksColumn = i;
      break;
    }
  }
  
  // Create City Links column if it doesn't exist
  if (cityLinksColumn === -1) {
    var lastColumn = sheet.getLastColumn();
    cityLinksColumn = lastColumn + 1;
    
    // Add header
    sheet.getRange(1, cityLinksColumn).setValue("City Links");
    sheet.getRange(1, cityLinksColumn).setFontWeight("bold");
    sheet.getRange(1, cityLinksColumn).setBackground("#e8f0fe");
  }
  
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
    "✅ City links generated successfully!\n\n" +
    "Processed " + processedCount + " rows.\n" +
    "City Links column at position " + (cityLinksColumn + 1) + "."
  );
}

function sendEmailCampaign() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Find column indices
  var businessNameCol = findColumnIndex(headers, ['Business Name', 'Business', 'Name']);
  var emailCol = findColumnIndex(headers, ['Email', 'E-mail']);
  var cityLinkCol = findColumnIndex(headers, ['City Link', 'City Links']);
  
  if (businessNameCol === -1 || emailCol === -1 || cityLinkCol === -1) {
    SpreadsheetApp.getUi().alert('❌ Error: Required columns not found!');
    return;
  }
  
  // Get email template from Gmail draft
  var template = getEmailTemplate();
  if (!template) return;
  
  // Count valid recipients
  var validRecipients = 0;
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var businessName = row[businessNameCol];
    var email = row[emailCol];
    var cityLink = row[cityLinkCol];
    
    if (businessName && email && cityLink) {
      validRecipients++;
    }
  }
  
  if (validRecipients === 0) {
    SpreadsheetApp.getUi().alert('❌ Error: No valid recipients found!');
    return;
  }
  
  // Confirm before sending
  var response = SpreadsheetApp.getUi().alert(
    '📧 Email Campaign Confirmation',
    'Are you sure you want to send emails to ' + validRecipients + ' recipients?',
    SpreadsheetApp.getUi().ButtonSet.YES_NO
  );
  
  if (response !== SpreadsheetApp.getUi().Button.YES) {
    return;
  }
  
  var successCount = 0;
  var errorCount = 0;
  var errors = [];
  
  // Process each row (skip header)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var businessName = row[businessNameCol];
    var email = row[emailCol];
    var cityLink = row[cityLinkCol];
    
    if (!businessName || !email || !cityLink) {
      errorCount++;
      errors.push('Row ' + (i + 1) + ': Missing data');
      continue;
    }
    
    try {
      // Replace placeholders in template
      var personalizedEmail = template
        .replace(/\{\{Business Name\}\}/g, businessName)
        .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
        .replace(/\{\{City Links\}\}/g, cityLink)
        .replace(/\{\{CITY_LINK\}\}/g, cityLink);
      
      // Get the draft's subject line
      var draft = GmailApp.getDrafts()[0];
      var message = draft.getMessage();
      var subject = message.getSubject();
      
      // Replace placeholders in subject if any
      var personalizedSubject = subject
        .replace(/\{\{Business Name\}\}/g, businessName)
        .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
        .replace(/\{\{City Links\}\}/g, cityLink)
        .replace(/\{\{CITY_LINK\}\}/g, cityLink);
      
      // Send email with simple formatting
      GmailApp.sendEmail(
        email,
        personalizedSubject,
        personalizedEmail,
        {
          name: 'Dog Boarding Kennels Directory'
        }
      );
      
      successCount++;
      
      // Add small delay to avoid rate limits
      Utilities.sleep(1000);
      
    } catch (error) {
      errorCount++;
      errors.push('Row ' + (i + 1) + ': ' + error.toString());
    }
  }
  
  // Show results
  var message = '📧 Email Campaign Complete!\n\n';
  message += '✅ Successfully sent: ' + successCount + ' emails\n';
  message += '❌ Failed: ' + errorCount + ' emails\n\n';
  
  if (errors.length > 0) {
    message += 'Errors:\n' + errors.slice(0, 5).join('\n');
    if (errors.length > 5) {
      message += '\n... and ' + (errors.length - 5) + ' more errors';
    }
  }
  
  SpreadsheetApp.getUi().alert('📧 Email Campaign Results', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

function testSingleEmail() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Find column indices
  var businessNameCol = findColumnIndex(headers, ['Business Name', 'Business', 'Name']);
  var emailCol = findColumnIndex(headers, ['Email', 'E-mail']);
  var cityLinkCol = findColumnIndex(headers, ['City Link', 'City Links']);
  
  if (businessNameCol === -1 || emailCol === -1 || cityLinkCol === -1) {
    SpreadsheetApp.getUi().alert('❌ Error: Required columns not found!');
    return;
  }
  
  var template = getEmailTemplate();
  if (!template) return;
  
  // Get first row data
  var row = data[1];
  var businessName = row[businessNameCol];
  var email = row[emailCol];
  var cityLink = row[cityLinkCol];
  
  if (!businessName || !email || !cityLink) {
    SpreadsheetApp.getUi().alert('❌ Error: No data in first row!');
    return;
  }
  
  var personalizedEmail = template
    .replace(/\{\{Business Name\}\}/g, businessName)
    .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
    .replace(/\{\{City Links\}\}/g, cityLink)
    .replace(/\{\{CITY_LINK\}\}/g, cityLink);
  
  try {
    // Get the draft's subject line
    var draft = GmailApp.getDrafts()[0];
    var message = draft.getMessage();
    var subject = message.getSubject();
    
    // Replace placeholders in subject if any
    var personalizedSubject = subject
      .replace(/\{\{Business Name\}\}/g, businessName)
      .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
      .replace(/\{\{City Links\}\}/g, cityLink)
      .replace(/\{\{CITY_LINK\}\}/g, cityLink);
    
    GmailApp.sendEmail(
      email,
      'TEST: ' + personalizedSubject,
      personalizedEmail,
      {
        name: 'Dog Boarding Kennels Directory'
      }
    );
    
    SpreadsheetApp.getUi().alert('✅ Test email sent successfully to: ' + email);
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Error sending test email: ' + error.toString());
  }
}

function removeUnnecessaryColumns() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Columns to remove
  var columnsToRemove = [
    'Category',
    'Review Rating', 
    'Number of Reviews',
    'Address',
    'Website',
    'Phone'
  ];
  
  var removedColumns = [];
  var columnsToDelete = [];
  
  // Find columns to remove
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i].toString().trim();
    for (var j = 0; j < columnsToRemove.length; j++) {
      if (header.toLowerCase() === columnsToRemove[j].toLowerCase()) {
        columnsToDelete.push(i + 1); // +1 because sheet columns are 1-indexed
        removedColumns.push(header);
        break;
      }
    }
  }
  
  if (columnsToDelete.length === 0) {
    SpreadsheetApp.getUi().alert('ℹ️ No unnecessary columns found to remove.');
    return;
  }
  
  // Confirm before removing
  var response = SpreadsheetApp.getUi().alert(
    '🗑️ Remove Columns Confirmation',
    'Are you sure you want to remove these columns?\n\n' + removedColumns.join('\n'),
    SpreadsheetApp.getUi().ButtonSet.YES_NO
  );
  
  if (response !== SpreadsheetApp.getUi().Button.YES) {
    return;
  }
  
  // Remove columns (from right to left to avoid index shifting)
  columnsToDelete.sort(function(a, b) { return b - a; });
  
  for (var i = 0; i < columnsToDelete.length; i++) {
    sheet.deleteColumn(columnsToDelete[i]);
  }
  
  // Show completion message
  SpreadsheetApp.getUi().alert(
    '✅ Columns removed successfully!\n\n' +
    'Removed ' + removedColumns.length + ' columns:\n' +
    removedColumns.join('\n')
  );
}

function getEmailTemplate() {
  // Get the first draft from Gmail
  var drafts = GmailApp.getDrafts();
  
  if (drafts.length === 0) {
    SpreadsheetApp.getUi().alert('❌ Error: No drafts found in Gmail!');
    return null;
  }
  
  // Use the first draft as template
  var draft = drafts[0];
  var message = draft.getMessage();
  
  // Get the email content
  var template = message.getPlainBody();
  
  // If no plain text, try HTML
  if (!template || template.trim() === '') {
    template = message.getBody();
  }
  
  if (!template || template.trim() === '') {
    SpreadsheetApp.getUi().alert('❌ Error: Draft email is empty!');
    return null;
  }
  
  return template;
}

function findColumnIndex(headers, possibleNames) {
  for (var i = 0; i < headers.length; i++) {
    for (var j = 0; j < possibleNames.length; j++) {
      if (headers[i].toString().toLowerCase().includes(possibleNames[j].toLowerCase())) {
        return i;
      }
    }
  }
  return -1;
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

