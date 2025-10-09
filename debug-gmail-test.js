/**
 * Simple Gmail Test Script
 * This will help us debug what's wrong with Gmail sending
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Gmail Debug')
    .addItem('🧪 Test Gmail Connection', 'testGmailConnection')
    .addItem('📧 Send Simple Test Email', 'sendSimpleTestEmail')
    .addItem('📋 Check Gmail Drafts', 'checkGmailDrafts')
    .addToUi();
}

function testGmailConnection() {
  try {
    // Test basic Gmail access
    var drafts = GmailApp.getDrafts();
    var message = "✅ Gmail Connection Test:\n\n";
    message += "Drafts found: " + drafts.length + "\n";
    
    if (drafts.length > 0) {
      var firstDraft = drafts[0];
      var draftMessage = firstDraft.getMessage();
      message += "First draft subject: " + draftMessage.getSubject() + "\n";
      message += "First draft has content: " + (draftMessage.getPlainBody().length > 0 ? "Yes" : "No") + "\n";
    }
    
    SpreadsheetApp.getUi().alert(message);
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Gmail Connection Error:\n\n" + error.toString());
  }
}

function sendSimpleTestEmail() {
  try {
    // Get your email from the sheet
    var sheet = SpreadsheetApp.getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    // Find email column
    var emailCol = -1;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].toLowerCase().includes("email")) {
        emailCol = i;
        break;
      }
    }
    
    if (emailCol === -1) {
      SpreadsheetApp.getUi().alert("❌ No email column found!");
      return;
    }
    
    // Get first email
    var testEmail = data[1][emailCol];
    if (!testEmail) {
      SpreadsheetApp.getUi().alert("❌ No email found in first row!");
      return;
    }
    
    // Send simple test email
    GmailApp.sendEmail(
      testEmail,
      "TEST: Simple Gmail Test",
      "This is a simple test email from Google Apps Script.\n\nIf you receive this, Gmail sending is working!",
      {
        name: 'Test Sender'
      }
    );
    
    SpreadsheetApp.getUi().alert("✅ Simple test email sent to: " + testEmail);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Error sending test email:\n\n" + error.toString());
  }
}

function checkGmailDrafts() {
  try {
    var drafts = GmailApp.getDrafts();
    var message = "📋 Gmail Drafts Check:\n\n";
    message += "Total drafts: " + drafts.length + "\n\n";
    
    if (drafts.length > 0) {
      for (var i = 0; i < Math.min(3, drafts.length); i++) {
        var draft = drafts[i];
        var draftMessage = draft.getMessage();
        message += "Draft " + (i + 1) + ":\n";
        message += "Subject: " + draftMessage.getSubject() + "\n";
        message += "Content length: " + draftMessage.getPlainBody().length + " characters\n\n";
      }
    } else {
      message += "No drafts found. Please create a draft email first.";
    }
    
    SpreadsheetApp.getUi().alert(message);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Error checking drafts:\n\n" + error.toString());
  }
}

