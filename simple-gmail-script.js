/**
 * Simple Gmail Script - No API Required
 * This uses the built-in GmailApp service
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 Simple Gmail')
    .addItem('📧 Send Test Email', 'sendTestEmail')
    .addItem('📋 Check Drafts', 'checkDrafts')
    .addToUi();
}

function sendTestEmail() {
  try {
    // Get your own email for testing
    var userEmail = Session.getActiveUser().getEmail();
    
    GmailApp.sendEmail(
      userEmail,
      "Test Email - " + new Date(),
      "This is a test email to verify Gmail sending works.\n\nSent at: " + new Date(),
      {
        name: 'Test Sender'
      }
    );
    
    SpreadsheetApp.getUi().alert("✅ Test email sent to: " + userEmail + "\n\nCheck your Gmail inbox!");
    
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Error: " + error.toString());
  }
}

function checkDrafts() {
  try {
    var drafts = GmailApp.getDrafts();
    var message = "📋 Gmail Drafts:\n\n";
    message += "Total drafts: " + drafts.length + "\n\n";
    
    if (drafts.length > 0) {
      for (var i = 0; i < Math.min(3, drafts.length); i++) {
        var draft = drafts[i];
        var draftMessage = draft.getMessage();
        message += "Draft " + (i + 1) + ":\n";
        message += "Subject: " + draftMessage.getSubject() + "\n";
        message += "Content: " + draftMessage.getPlainBody().substring(0, 100) + "...\n\n";
      }
    } else {
      message += "No drafts found. Please create a draft email first.";
    }
    
    SpreadsheetApp.getUi().alert(message);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Error: " + error.toString());
  }
}

