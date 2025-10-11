function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Business Tools')
      .addItem('Generate City Links', 'generateCityLinks')
      .addItem('Send Email Campaign', 'sendEmailCampaign')
      .addItem('Test Single Email', 'testSingleEmail')
      .addItem('Check Email Status', 'checkEmailStatus')
      .addItem('Remove Unnecessary Columns', 'removeUnnecessaryColumns')
      .addItem('Debug Email Setup', 'debugEmailSetup')
      .addItem('Test Gmail Connection', 'testGmailConnection')
      .addToUi();
  } catch (error) {
    console.log('Menu creation error:', error);
  }
}

function createMenu() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Business Tools')
      .addItem('Generate City Links', 'generateCityLinks')
      .addItem('Send Email Campaign', 'sendEmailCampaign')
      .addItem('Test Single Email', 'testSingleEmail')
      .addItem('Check Email Status', 'checkEmailStatus')
      .addItem('Remove Unnecessary Columns', 'removeUnnecessaryColumns')
      .addItem('Debug Email Setup', 'debugEmailSetup')
      .addItem('Test Gmail Connection', 'testGmailConnection')
      .addToUi();
  } catch (error) {
    console.log('Menu creation error:', error);
  }
}

function debugEmailSetup() {
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var businessNameCol = findColumnIndex(headers, ['Business Name', 'Business', 'Name']);
    var emailCol = findColumnIndex(headers, ['Email', 'E-mail']);
    var cityLinkCol = findColumnIndex(headers, ['City Link', 'City Links']);
    
    var message = 'Email Setup Debug:\n\n';
    message += 'Business Name Column: ' + (businessNameCol + 1) + '\n';
    message += 'Email Column: ' + (emailCol + 1) + '\n';
    message += 'City Link Column: ' + (cityLinkCol + 1) + '\n\n';
    
    if (businessNameCol === -1) message += '❌ Business Name column not found!\n';
    if (emailCol === -1) message += '❌ Email column not found!\n';
    if (cityLinkCol === -1) message += '❌ City Link column not found!\n';
    
    message += '\nFirst row data:\n';
    if (data.length > 1) {
      var row = data[1];
      message += 'Business Name: ' + (row[businessNameCol] || 'EMPTY') + '\n';
      message += 'Email: ' + (row[emailCol] || 'EMPTY') + '\n';
      message += 'City Link: ' + (row[cityLinkCol] || 'EMPTY') + '\n';
    }
    
    Browser.msgBox('Email Setup Debug', message);
  } catch (error) {
    Browser.msgBox('Debug failed: ' + error.toString());
  }
}

function testGmailConnection() {
  try {
    var drafts = GmailApp.getDrafts();
    var message = 'Gmail Connection Test:\n\n';
    message += 'Drafts found: ' + drafts.length + '\n';
    
    if (drafts.length > 0) {
      var draft = drafts[0];
      var draftMessage = draft.getMessage();
      var subject = draftMessage.getSubject();
      var body = draftMessage.getPlainBody();
      
      message += 'First draft subject: ' + subject + '\n';
      message += 'First draft body length: ' + body.length + ' characters\n';
    } else {
      message += '❌ No drafts found! Create a draft in Gmail first.\n';
    }
    
    // Test sending a simple email
    try {
      GmailApp.sendEmail(
        'test@example.com',
        'Test Email',
        'This is a test email to verify Gmail connection.',
        {
          name: 'Test Sender'
        }
      );
      message += '\n✅ Gmail send test: SUCCESS (test email sent)\n';
    } catch (sendError) {
      message += '\n❌ Gmail send test: FAILED - ' + sendError.toString() + '\n';
    }
    
    Browser.msgBox('Gmail Connection Test', message);
  } catch (error) {
    Browser.msgBox('Gmail test failed: ' + error.toString());
  }
}

function generateCityLinks() {
  createMenu();
  
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    
    var headers = values[0];
    var addressColumnIndex = -1;
    
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].toLowerCase().includes("address")) {
        addressColumnIndex = i;
        break;
      }
    }
    
    if (addressColumnIndex === -1) {
      Browser.msgBox("Error: No Address column found!");
      return;
    }
    
    var cityLinksColumn = -1;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].toLowerCase().includes("city link")) {
        cityLinksColumn = i;
        break;
      }
    }
    
    if (cityLinksColumn === -1) {
      var lastColumn = sheet.getLastColumn();
      cityLinksColumn = lastColumn + 1;
      
      sheet.getRange(1, cityLinksColumn).setValue("City Links");
      sheet.getRange(1, cityLinksColumn).setFontWeight("bold");
      sheet.getRange(1, cityLinksColumn).setBackground("#e8f0fe");
    }
    
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
    
    SpreadsheetApp.flush();
    Utilities.sleep(2000);
    
    Browser.msgBox(
      "City links generated successfully!\n\n" +
      "Processed " + processedCount + " rows.\n" +
      "City Links column at position " + (cityLinksColumn + 1) + "."
    );
  } catch (error) {
    Browser.msgBox("Error in generateCityLinks: " + error.toString());
  }
}

function sendEmailCampaign() {
  createMenu();
  
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var businessNameCol = findColumnIndex(headers, ['Business Name', 'Business', 'Name']);
    var emailCol = findColumnIndex(headers, ['Email', 'E-mail']);
    var cityLinkCol = findColumnIndex(headers, ['City Link', 'City Links']);
    
    if (businessNameCol === -1 || emailCol === -1 || cityLinkCol === -1) {
      Browser.msgBox('Error: Required columns not found!\n\nRun "Debug Email Setup" to see what columns are available.');
      return;
    }
    
    var emailSentCol = findColumnIndex(headers, ['Email Sent', 'Email Status', 'Sent']);
    if (emailSentCol === -1) {
      var lastColumn = sheet.getLastColumn();
      emailSentCol = lastColumn + 1;
      
      sheet.getRange(1, emailSentCol).setValue("Email Sent");
      sheet.getRange(1, emailSentCol).setFontWeight("bold");
      sheet.getRange(1, emailSentCol).setBackground("#e8f0fe");
      
      SpreadsheetApp.flush();
      Utilities.sleep(2000);
    }
    
    // Check if we have a Gmail draft
    var drafts = GmailApp.getDrafts();
    if (drafts.length === 0) {
      Browser.msgBox('Error: No drafts found in Gmail!\n\nPlease create a draft email in Gmail first.');
      return;
    }
    
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
      Browser.msgBox('Error: No valid recipients found!\n\nRun "Debug Email Setup" to check your data.');
      return;
    }
    
    var response = Browser.msgBox(
      'Email Campaign Confirmation',
      'Are you sure you want to send emails to ' + validRecipients + ' recipients?\n\nThis will send real emails!',
      Browser.Buttons.YES_NO
    );
    
    if (response !== Browser.Buttons.YES) {
      return;
    }
    
    var successCount = 0;
    var errorCount = 0;
    var errors = [];
    
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
        var cleanTemplate = createCleanEmailTemplate(businessName, cityLink);
        
        var draft = GmailApp.getDrafts()[0];
        var message = draft.getMessage();
        var subject = message.getSubject();
        
        var personalizedSubject = subject
          .replace(/\{\{Business Name\}\}/g, businessName)
          .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
          .replace(/\{\{City Links\}\}/g, cityLink)
          .replace(/\{\{CITY_LINK\}\}/g, cityLink);
        
        // Actually send the email
        GmailApp.sendEmail(
          email,
          personalizedSubject,
          cleanTemplate,
          {
            htmlBody: formatEmailWithBold(cleanTemplate),
            name: 'Dog Boarding Kennels Directory'
          }
        );
        
        // Update status
        sheet.getRange(i + 1, emailSentCol).setValue("Sent");
        sheet.getRange(i + 1, emailSentCol).setBackground("#d4edda");
        
        SpreadsheetApp.flush();
        Utilities.sleep(1000);
        
        successCount++;
        
        // Show progress notification every 2 emails
        if (successCount % 2 === 0) {
          Browser.msgBox('Progress Update', 'Sent ' + successCount + ' emails so far...\n\nRow ' + (i + 1) + ' completed.');
        }
        
        Utilities.sleep(10000);
        
      } catch (error) {
        sheet.getRange(i + 1, emailSentCol).setValue("Failed");
        sheet.getRange(i + 1, emailSentCol).setBackground("#f8d7da");
        
        SpreadsheetApp.flush();
        Utilities.sleep(1000);
        
        errorCount++;
        errors.push('Row ' + (i + 1) + ': ' + error.toString());
      }
    }
    
    SpreadsheetApp.flush();
    Utilities.sleep(2000);
    
    var message = 'Email Campaign Complete!\n\n';
    message += 'Successfully sent: ' + successCount + ' emails\n';
    message += 'Failed: ' + errorCount + ' emails\n\n';
    
    if (errors.length > 0) {
      message += 'Errors:\n' + errors.slice(0, 5).join('\n');
      if (errors.length > 5) {
        message += '\n... and ' + (errors.length - 5) + ' more errors';
      }
    }
    
    Browser.msgBox('Email Campaign Results', message);
  } catch (error) {
    Browser.msgBox("Error in sendEmailCampaign: " + error.toString());
  }
}

function testSingleEmail() {
  createMenu();
  
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var businessNameCol = findColumnIndex(headers, ['Business Name', 'Business', 'Name']);
    var emailCol = findColumnIndex(headers, ['Email', 'E-mail']);
    var cityLinkCol = findColumnIndex(headers, ['City Link', 'City Links']);
    
    if (businessNameCol === -1 || emailCol === -1 || cityLinkCol === -1) {
      Browser.msgBox('Error: Required columns not found!');
      return;
    }
    
    var row = data[1];
    var businessName = row[businessNameCol];
    var email = row[emailCol];
    var cityLink = row[cityLinkCol];
    
    if (!businessName || !email || !cityLink) {
      Browser.msgBox('Error: No data in first row!');
      return;
    }
    
    var cleanTemplate = createCleanEmailTemplate(businessName, cityLink);
    
    var draft = GmailApp.getDrafts()[0];
    var message = draft.getMessage();
    var subject = message.getSubject();
    
    var personalizedSubject = subject
      .replace(/\{\{Business Name\}\}/g, businessName)
      .replace(/\{\{BUSINESS_NAME\}\}/g, businessName)
      .replace(/\{\{City Links\}\}/g, cityLink)
      .replace(/\{\{CITY_LINK\}\}/g, cityLink);
    
    // Actually send the test email
    GmailApp.sendEmail(
      email,
      'TEST: ' + personalizedSubject,
      cleanTemplate,
      {
        htmlBody: formatEmailWithBold(cleanTemplate),
        name: 'Dog Boarding Kennels Directory'
      }
    );
    
    SpreadsheetApp.flush();
    Utilities.sleep(2000);
    
    Browser.msgBox('Test email sent successfully to: ' + email);
  } catch (error) {
    Browser.msgBox('Error sending test email: ' + error.toString());
  }
}

function createCleanEmailTemplate(businessName, cityLink) {
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
  createMenu();
  
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var emailSentCol = findColumnIndex(headers, ['Email Sent', 'Email Status', 'Sent']);
    
    if (emailSentCol === -1) {
      Browser.msgBox('No Email Sent column found!\n\nRun "Send Email Campaign" first to create the tracking column.');
      return;
    }
    
    var sentCount = 0;
    var failedCount = 0;
    var notSentCount = 0;
    
    for (var i = 1; i < data.length; i++) {
      var status = data[i][emailSentCol];
      if (status && status.toString().includes('Sent')) {
        sentCount++;
      } else if (status && status.toString().includes('Failed')) {
        failedCount++;
      } else {
        notSentCount++;
      }
    }
    
    var message = 'Email Status Report:\n\n';
    message += 'Sent: ' + sentCount + ' emails\n';
    message += 'Failed: ' + failedCount + ' emails\n';
    message += 'Not Sent: ' + notSentCount + ' emails\n\n';
    message += 'Total rows: ' + (data.length - 1);
    
    Browser.msgBox('Email Status', message);
  } catch (error) {
    Browser.msgBox("Error in checkEmailStatus: " + error.toString());
  }
}

function formatEmailWithBold(text) {
  var html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  
  return '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">' + 
         html + 
         '</div>';
}

function removeUnnecessaryColumns() {
  createMenu();
  
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var columnsToRemove = [
      'Category',
      'Review Rating', 
      'Number of Reviews',
      'Address',
      'Website',
      'Phone',
      'Rating',
      'Reviews',
      'Contact',
      'Location'
    ];
    
    var removedColumns = [];
    var columnsToDelete = [];
    
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i].toString().trim();
      for (var j = 0; j < columnsToRemove.length; j++) {
        if (header.toLowerCase() === columnsToRemove[j].toLowerCase()) {
          columnsToDelete.push(i + 1);
          removedColumns.push(header);
          break;
        }
      }
    }
    
    if (columnsToDelete.length === 0) {
      Browser.msgBox('No unnecessary columns found to remove.\n\nCurrent columns: ' + headers.join(', '));
      return;
    }
    
    var response = Browser.msgBox(
      'Remove Columns Confirmation',
      'Are you sure you want to remove these columns?\n\n' + removedColumns.join('\n'),
      Browser.Buttons.YES_NO
    );
    
    if (response !== Browser.Buttons.YES) {
      return;
    }
    
    columnsToDelete.sort(function(a, b) { return b - a; });
    
    for (var i = 0; i < columnsToDelete.length; i++) {
      sheet.deleteColumn(columnsToDelete[i]);
      SpreadsheetApp.flush();
      Utilities.sleep(1000);
    }
    
    SpreadsheetApp.flush();
    Utilities.sleep(2000);
    
    Browser.msgBox(
      'Columns removed successfully!\n\n' +
      'Removed ' + removedColumns.length + ' columns:\n' +
      removedColumns.join('\n')
    );
  } catch (error) {
    Browser.msgBox("Error in removeUnnecessaryColumns: " + error.toString());
  }
}

function getEmailTemplate() {
  try {
    var drafts = GmailApp.getDrafts();
    
    if (drafts.length === 0) {
      Browser.msgBox('Error: No drafts found in Gmail!');
      return null;
    }
    
    var draft = drafts[0];
    var message = draft.getMessage();
    
    var template = message.getPlainBody();
    
    if (!template || template.trim() === '') {
      template = message.getBody();
    }
    
    if (!template || template.trim() === '') {
      Browser.msgBox('Error: Draft email is empty!');
      return null;
    }
    
    return template;
  } catch (error) {
    Browser.msgBox("Error getting email template: " + error.toString());
    return null;
  }
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
  
  var patterns = [
    /,\s*([^,]+),\s*[A-Z]{2}\s*\d{5}/,
    /,\s*([^,]+),\s*[A-Z]{2}/,
    /,\s*([^,]+),\s*United States/,
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

