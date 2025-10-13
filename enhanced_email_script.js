/**
 * Enhanced Business Script with Live Progress Notifications
 * This script provides real-time feedback during email campaigns
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏢 Business Tools')
    .addItem('🔗 Generate City Links', 'generateCityLinks')
    .addItem('📧 Send Email Campaign', 'sendEmailCampaign')
    .addItem('🧪 Test Single Email', 'testSingleEmail')
    .addItem('📊 Check Email Status', 'checkEmailStatus')
    .addItem('🗑️ Remove Unnecessary Columns', 'removeUnnecessaryColumns')
    .addItem('🔄 Reset Email Status', 'resetEmailStatus')
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
  
  // Create Email Sent column if it doesn't exist
  var emailSentCol = findColumnIndex(headers, ['Email Sent', 'Email Status', 'Sent']);
  if (emailSentCol === -1) {
    var lastColumn = sheet.getLastColumn();
    emailSentCol = lastColumn + 1;
    
    // Add header
    sheet.getRange(1, emailSentCol).setValue("Email Sent");
    sheet.getRange(1, emailSentCol).setFontWeight("bold");
    sheet.getRange(1, emailSentCol).setBackground("#e8f0fe");
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
    'Are you sure you want to send emails to ' + validRecipients + ' recipients?\n\n' +
    'This will take approximately ' + Math.ceil(validRecipients * 10 / 60) + ' minutes.',
    SpreadsheetApp.getUi().ButtonSet.YES_NO
  );
  
  if (response !== SpreadsheetApp.getUi().Button.YES) {
    return;
  }
  
  // Add progress tracking columns
  addProgressTrackingColumns(sheet, emailSentCol);
  
  var successCount = 0;
  var errorCount = 0;
  var errors = [];
  var currentRow = 0;
  
  // Show initial progress
  updateProgressDisplay(sheet, 0, validRecipients, "Starting email campaign...");
  
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
    
    currentRow++;
    
    try {
      // Update progress display
      updateProgressDisplay(sheet, currentRow, validRecipients, 
        "Sending email " + currentRow + " of " + validRecipients + " to " + businessName);
      
      // Mark as processing
      sheet.getRange(i + 1, emailSentCol).setValue("⏳ Processing...");
      sheet.getRange(i + 1, emailSentCol).setBackground("#fff3cd");
      
      // Create a clean email template
      var cleanTemplate = createCleanEmailTemplate(businessName, cityLink);
      
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
      
      // Send email with HTML formatting for bold text
      GmailApp.sendEmail(
        email,
        personalizedSubject,
        cleanTemplate,
        {
          htmlBody: formatEmailWithBold(cleanTemplate),
          name: 'Dog Boarding Kennels Directory'
        }
      );
      
      // Mark email as sent in the sheet
      sheet.getRange(i + 1, emailSentCol).setValue("✅ Sent");
      sheet.getRange(i + 1, emailSentCol).setBackground("#d4edda");
      
      successCount++;
      
      // Show toast notification for each successful send
      SpreadsheetApp.getActiveSpreadsheet().toast(
        "✅ Email " + currentRow + " of " + validRecipients + " sent to " + businessName,
        "Email Progress",
        3
      );
      
      // Add 10 second delay to avoid rate limits
      Utilities.sleep(10000);
      
    } catch (error) {
      // Mark email as failed in the sheet
      sheet.getRange(i + 1, emailSentCol).setValue("❌ Failed");
      sheet.getRange(i + 1, emailSentCol).setBackground("#f8d7da");
      
      errorCount++;
      errors.push('Row ' + (i + 1) + ': ' + error.toString());
      
      // Show toast notification for errors
      SpreadsheetApp.getActiveSpreadsheet().toast(
        "❌ Email " + currentRow + " of " + validRecipients + " failed for " + businessName,
        "Email Error",
        3
      );
    }
  }
  
  // Clear progress display
  clearProgressDisplay(sheet);
  
  // Show final results
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

function addProgressTrackingColumns(sheet, emailSentCol) {
  // Add a progress tracking row at the top
  var progressRow = 2; // Insert after header
  
  // Insert a new row for progress tracking
  sheet.insertRowAfter(1);
  
  // Add progress labels
  sheet.getRange(progressRow, 1).setValue("📊 PROGRESS TRACKER");
  sheet.getRange(progressRow, 1).setFontWeight("bold");
  sheet.getRange(progressRow, 1).setBackground("#e3f2fd");
  
  // Add progress status cell
  sheet.getRange(progressRow, emailSentCol).setValue("⏳ Ready to start...");
  sheet.getRange(progressRow, emailSentCol).setBackground("#fff3cd");
  sheet.getRange(progressRow, emailSentCol).setFontWeight("bold");
}

function updateProgressDisplay(sheet, current, total, status) {
  var progressRow = 2; // Progress tracking row
  var emailSentCol = findColumnIndex(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0], 
    ['Email Sent', 'Email Status', 'Sent']);
  
  if (emailSentCol === -1) return;
  
  var percentage = Math.round((current / total) * 100);
  var progressText = "📈 " + current + "/" + total + " (" + percentage + "%) - " + status;
  
  sheet.getRange(progressRow, emailSentCol).setValue(progressText);
  
  // Color code based on progress
  if (current === 0) {
    sheet.getRange(progressRow, emailSentCol).setBackground("#fff3cd"); // Yellow
  } else if (current === total) {
    sheet.getRange(progressRow, emailSentCol).setBackground("#d4edda"); // Green
  } else {
    sheet.getRange(progressRow, emailSentCol).setBackground("#cce5ff"); // Blue
  }
}

function clearProgressDisplay(sheet) {
  var progressRow = 2; // Progress tracking row
  var emailSentCol = findColumnIndex(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0], 
    ['Email Sent', 'Email Status', 'Sent']);
  
  if (emailSentCol === -1) return;
  
  sheet.getRange(progressRow, emailSentCol).setValue("✅ Campaign Complete");
  sheet.getRange(progressRow, emailSentCol).setBackground("#d4edda");
  
  // Remove the progress row after 5 seconds
  Utilities.sleep(5000);
  sheet.deleteRow(progressRow);
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
  
  // Get first row data
  var row = data[1];
  var businessName = row[businessNameCol];
  var email = row[emailCol];
  var cityLink = row[cityLinkCol];
  
  if (!businessName || !email || !cityLink) {
    SpreadsheetApp.getUi().alert('❌ Error: No data in first row!');
    return;
  }
  
  // Show progress
  SpreadsheetApp.getActiveSpreadsheet().toast("Sending test email to " + businessName + "...", "Test Email", 2);
  
  try {
    // Create a clean email template
    var cleanTemplate = createCleanEmailTemplate(businessName, cityLink);
    
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
      cleanTemplate,
      {
        htmlBody: formatEmailWithBold(cleanTemplate),
        name: 'Dog Boarding Kennels Directory'
      }
    );
    
    SpreadsheetApp.getActiveSpreadsheet().toast("✅ Test email sent successfully!", "Success", 3);
    SpreadsheetApp.getUi().alert('✅ Test email sent successfully to: ' + email);
  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().toast("❌ Test email failed: " + error.toString(), "Error", 5);
    SpreadsheetApp.getUi().alert('❌ Error sending test email: ' + error.toString());
  }
}

function resetEmailStatus() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Find Email Sent column
  var emailSentCol = findColumnIndex(headers, ['Email Sent', 'Email Status', 'Sent']);
  
  if (emailSentCol === -1) {
    SpreadsheetApp.getUi().alert('❌ No Email Sent column found!');
    return;
  }
  
  // Confirm reset
  var response = SpreadsheetApp.getUi().alert(
    '🔄 Reset Email Status',
    'Are you sure you want to reset all email statuses? This will clear all sent/failed statuses.',
    SpreadsheetApp.getUi().ButtonSet.YES_NO
  );
  
  if (response !== SpreadsheetApp.getUi().Button.YES) {
    return;
  }
  
  // Clear all statuses
  for (var i = 2; i <= data.length; i++) {
    sheet.getRange(i, emailSentCol).setValue("");
    sheet.getRange(i, emailSentCol).setBackground("#ffffff");
  }
  
  SpreadsheetApp.getActiveSpreadsheet().toast("✅ Email statuses reset successfully!", "Reset Complete", 3);
}

function createCleanEmailTemplate(businessName, cityLink) {
  // Create a clean email template without formatting issues
  var template = `Hi **${businessName}**,

I hope you're doing well.

I'm reaching out from **Dog Boarding Kennels**, where your business **${businessName}** is already listed under our local directory for your area. We've added your listing to help nearby pet owners find your services more easily.

To help improve your online visibility and ranking, I'd like to request a small favor — please add a link from your website to your listing on our directory.

Here's your city page link:
${cityLink}

Adding this link can:

• Boost your local SEO and help more pet owners find you on Google.
• Strengthen your credibility among verified local kennels.
• Support a trusted network of pet care providers nationwide.

If you'd like, we can also feature your business as a "Recommended Listing" on our homepage for extra visibility.

Please let me know once you've added the link, or if you'd prefer, I can send you a short snippet of code to make it easier.

Warm regards,
Manish Jain
**Dog Boarding Kennels Inc.**`;

  return template;
}

function checkEmailStatus() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Find Email Sent column
  var emailSentCol = findColumnIndex(headers, ['Email Sent', 'Email Status', 'Sent']);
  
  if (emailSentCol === -1) {
    SpreadsheetApp.getUi().alert('❌ No Email Sent column found!\n\nRun "Send Email Campaign" first to create the tracking column.');
    return;
  }
  
  var sentCount = 0;
  var failedCount = 0;
  var notSentCount = 0;
  var processingCount = 0;
  
  // Count statuses
  for (var i = 1; i < data.length; i++) {
    var status = data[i][emailSentCol];
    if (status && status.toString().includes('✅')) {
      sentCount++;
    } else if (status && status.toString().includes('❌')) {
      failedCount++;
    } else if (status && status.toString().includes('⏳')) {
      processingCount++;
    } else {
      notSentCount++;
    }
  }
  
  var message = '📊 Email Status Report:\n\n';
  message += '✅ Sent: ' + sentCount + ' emails\n';
  message += '❌ Failed: ' + failedCount + ' emails\n';
  message += '⏳ Processing: ' + processingCount + ' emails\n';
  message += '⏸️ Not Sent: ' + notSentCount + ' emails\n\n';
  message += 'Total rows: ' + (data.length - 1);
  
  SpreadsheetApp.getUi().alert('📊 Email Status', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

function formatEmailWithBold(text) {
  // Convert **text** to <strong>text</strong> for HTML emails
  var html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  
  // Wrap in proper HTML structure
  return '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">' + 
         html + 
         '</div>';
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

