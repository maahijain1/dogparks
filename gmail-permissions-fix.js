/**
 * Gmail Permissions Fix Script
 * This will help us get the right permissions for Gmail
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🔐 Gmail Permissions')
    .addItem('🔑 Request Gmail Permissions', 'requestGmailPermissions')
    .addItem('📧 Test Gmail Send', 'testGmailSend')
    .addToUi();
}

function requestGmailPermissions() {
  try {
    // This will trigger the permission request
    var drafts = GmailApp.getDrafts();
    SpreadsheetApp.getUi().alert("✅ Gmail permissions are working!\n\nFound " + drafts.length + " drafts.");
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Permission Error:\n\n" + error.toString() + "\n\nYou may need to:\n1. Run the script again\n2. Grant permissions when prompted\n3. Check your Google account settings");
  }
}

function testGmailSend() {
  try {
    // Get your own email for testing
    var userEmail = Session.getActiveUser().getEmail();
    
    GmailApp.sendEmail(
      userEmail,
      "Gmail Test - " + new Date(),
      "This is a test email to verify Gmail sending works.\n\nSent at: " + new Date(),
      {
        name: 'Gmail Test Script'
      }
    );
    
    SpreadsheetApp.getUi().alert("✅ Test email sent to yourself: " + userEmail + "\n\nCheck your Gmail inbox!");
    
  } catch (error) {
    SpreadsheetApp.getUi().alert("❌ Gmail Send Error:\n\n" + error.toString() + "\n\nPossible issues:\n1. Gmail API not enabled\n2. Insufficient permissions\n3. Google account restrictions");
  }
}

