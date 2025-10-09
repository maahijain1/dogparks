function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 Mail Merge')
    .addItem('📧 Send Mail Merge', 'sendMailMerge')
    .addItem('📋 Preview Emails', 'previewEmails')
    .addItem('🧪 Test Single Email', 'testSingleEmail')
    .addToUi();
}

function sendMailMerge() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  
  // Find column indices
  var businessNameCol = findColumnIndex(headers, ['Business Name', 'Business', 'Name']);
  var emailCol = findColumnIndex(headers, ['Email', 'E-mail']);
  var cityLinkCol = findColumnIndex(headers, ['City Link', 'City Links']);
  
  if (businessNameCol === -1 || emailCol === -1 || cityLinkCol === -1) {
    SpreadsheetApp.getUi().alert('❌ Error: Required columns not found!\n\nPlease ensure your sheet has:\n- Business Name column\n- Email column\n- City Link column');
    return;
  }
  
  // Get email template
  var template = getEmailTemplate();
  if (!template) return;
  
  // Confirm before creating drafts
  var response = SpreadsheetApp.getUi().alert(
    '📧 Mail Merge Confirmation',
    'Are you sure you want to create ' + (data.length - 1) + ' email drafts?\n\nThis will create drafts in your Gmail account.',
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
        .replace(/{{BUSINESS_NAME}}/g, businessName)
        .replace(/{{CITY_LINK}}/g, cityLink);
      
      // Get the draft's subject line
      var draft = GmailApp.getDrafts()[0];
      var message = draft.getMessage();
      var subject = message.getSubject();
      
      // Replace placeholders in subject if any
      var personalizedSubject = subject
        .replace(/{{BUSINESS_NAME}}/g, businessName)
        .replace(/{{CITY_LINK}}/g, cityLink);
      
      // Create draft instead of sending
      GmailApp.createDraft(
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
      Utilities.sleep(500);
      
    } catch (error) {
      errorCount++;
      errors.push('Row ' + (i + 1) + ': ' + error.toString());
    }
  }
  
  // Show results
  var message = '📧 Mail Merge Complete!\n\n';
  message += '✅ Successfully created: ' + successCount + ' drafts\n';
  message += '❌ Failed: ' + errorCount + ' drafts\n\n';
  message += '📧 Check your Gmail drafts folder to review and send the emails.\n\n';
  
  if (errors.length > 0) {
    message += 'Errors:\n' + errors.slice(0, 5).join('\n');
    if (errors.length > 5) {
      message += '\n... and ' + (errors.length - 5) + ' more errors';
    }
  }
  
  SpreadsheetApp.getUi().alert('📧 Mail Merge Results', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

function previewEmails() {
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
  
  var preview = '📧 Email Preview (First 3 recipients):\n\n';
  
  // Show preview for first 3 rows
  for (var i = 1; i <= Math.min(3, data.length - 1); i++) {
    var row = data[i];
    var businessName = row[businessNameCol];
    var email = row[emailCol];
    var cityLink = row[cityLinkCol];
    
    if (businessName && email && cityLink) {
      var personalizedEmail = template
        .replace(/{{BUSINESS_NAME}}/g, businessName)
        .replace(/{{CITY_LINK}}/g, cityLink);
      
      preview += '--- Email ' + i + ' ---\n';
      preview += 'To: ' + email + '\n';
      preview += 'Subject: Your Business Listing is Live! 🎉\n\n';
      preview += personalizedEmail.substring(0, 200) + '...\n\n';
    }
  }
  
  SpreadsheetApp.getUi().alert('📧 Email Preview', preview, SpreadsheetApp.getUi().ButtonSet.OK);
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
    .replace(/{{BUSINESS_NAME}}/g, businessName)
    .replace(/{{CITY_LINK}}/g, cityLink);
  
  try {
    // Get the draft's subject line
    var draft = GmailApp.getDrafts()[0];
    var message = draft.getMessage();
    var subject = message.getSubject();
    
    // Replace placeholders in subject if any
    var personalizedSubject = subject
      .replace(/{{BUSINESS_NAME}}/g, businessName)
      .replace(/{{CITY_LINK}}/g, cityLink);
    
    GmailApp.createDraft(
      email,
      'TEST: ' + personalizedSubject,
      personalizedEmail,
      {
        htmlBody: personalizedEmail,
        name: 'Dog Boarding Kennels Directory'
      }
    );
    
    SpreadsheetApp.getUi().alert('✅ Test draft created successfully for: ' + email);
  } catch (error) {
    SpreadsheetApp.getUi().alert('❌ Error creating test draft: ' + error.toString());
  }
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
