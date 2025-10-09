/**
 * Gmail API Setup Script
 * This script will help you enable Gmail API and test it
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Gmail Setup')
    .addItem('🔑 Enable Gmail API', 'enableGmailAPI')
    .addItem('📧 Test Gmail Send', 'testGmailSend')
    .addItem('📋 Check Gmail Status', 'checkGmailStatus')
    .addItem('🚀 Run Full Email Campaign', 'runFullEmailCampaign')
    .addToUi();
}

function enableGmailAPI() {
  try {
    // This will trigger the Gmail API permission request
    var message = "🔑 Gmail API Setup:\n\n";
    
    // Try to access Gmail
    var drafts = GmailApp.getDrafts();
    message += "✅ Gmail API is already enabled!\n";
    message += "Found " + drafts.length + " drafts.\n\n";
    message += "You can now use the email campaign features.";
    
    SpreadsheetApp.getUi().alert(message);
    
  } catch (error) {
    var errorMessage = "❌ Gmail API Setup Required:\n\n";
    errorMessage += "Error: " + error.toString() + "\n\n";
    errorMessage += "To fix this:\n\n";
    errorMessage += "1. Go to Google Apps Script\n";
    errorMessage += "2. Click 'Services' in the left menu\n";
    errorMessage += "3. Click '+ Add a service'\n";
    errorMessage += "4. Find 'Gmail API' and click 'Add'\n";
    errorMessage += "5. Or go to 'Resources' → 'Advanced Google Services'\n";
    errorMessage += "6. Turn ON 'Gmail API'\n\n";
    errorMessage += "Then run this script again.";
    
    SpreadsheetApp.getUi().alert(errorMessage);
  }
}

function testGmailSend() {
  try {
    // Get your own email for testing
    var userEmail = Session.getActiveUser().getEmail();
    
    GmailApp.sendEmail(
      userEmail,
      "Gmail API Test - " + new Date(),
      "This is a test email to verify Gmail API is working.\n\nSent at: " + new Date() + "\n\nIf you receive this, Gmail API is properly configured!",
      {
        name: 'Gmail API Test'
      }
    );
    
    SpreadsheetApp.getUi().alert("✅ Test email sent successfully!\n\nTo: " + userEmail + "\n\nCheck your Gmail inbox!");
    
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Gmail Send Error:\n\n" + error.toString() + "\n\nPlease enable Gmail API first using the 'Enable Gmail API' button.");
  }
}

function checkGmailStatus() {
  try {
    var message = "📋 Gmail Status Check:\n\n";
    
    // Check drafts
    var drafts = GmailApp.getDrafts();
    message += "✅ Gmail API: Working\n";
    message += "📧 Drafts found: " + drafts.length + "\n\n";
    
    if (drafts.length > 0) {
      message += "Your Gmail draft:\n";
      var firstDraft = drafts[0];
      var draftMessage = firstDraft.getMessage();
      message += "Subject: " + draftMessage.getSubject() + "\n";
      message += "Content length: " + draftMessage.getPlainBody().length + " characters\n\n";
    }
    
    message += "✅ Ready to send emails!";
    
    SpreadsheetApp.getUi().alert(message);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Gmail Status Error:\n\n" + error.toString() + "\n\nPlease enable Gmail API first.");
  }
}

function runFullEmailCampaign() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Find column indices
  var businessNameCol = findColumnIndex(headers, ['Business Name', 'Business', 'Name']);
  var emailCol = findColumnIndex(headers, ['Email', 'E-mail']);
  var cityLinkCol = findColumnIndex(headers, ['City Link', 'City Links']);
  
  if (businessNameCol === -1 || emailCol === -1 || cityLinkCol === -1) {
    SpreadsheetApp.getUi().alert('❌ Error: Required columns not found!\n\nPlease ensure your sheet has:\n- Business Name column\n- Email column\n- City Link column\n\nRun "Generate City Links" first if needed.');
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
    'Are you sure you want to send emails to ' + validRecipients + ' recipients?\n\nThis will send emails directly from your Gmail account.\n\nThis action cannot be undone!',
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
        .replace(/{{Business Name}}/g, businessName)
        .replace(/{{City Links}}/g, cityLink);
      
      // Get the draft's subject line
      var draft = GmailApp.getDrafts()[0];
      var message = draft.getMessage();
      var subject = message.getSubject();
      
      // Replace placeholders in subject if any
      var personalizedSubject = subject
        .replace(/{{Business Name}}/g, businessName)
        .replace(/{{City Links}}/g, cityLink);
      
      // Send email directly
      GmailApp.sendEmail(
        email,
        personalizedSubject,
        personalizedEmail,
        {
          htmlBody: personalizedEmail,
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

function getEmailTemplate() {
  // Get the first draft from Gmail
  var drafts = GmailApp.getDrafts();
  
  if (drafts.length === 0) {
    SpreadsheetApp.getUi().alert('❌ Error: No drafts found in Gmail!\n\nPlease create a draft email first.');
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
    SpreadsheetApp.getUi().alert('❌ Error: Draft email is empty!\n\nPlease add content to your draft email.');
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

