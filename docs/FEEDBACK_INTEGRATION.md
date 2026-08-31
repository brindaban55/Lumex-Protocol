# 📝 Google Sheets Feedback Integration Guide (Lumex Protocol)

This guide documents how to connect the in-app Developer Dispatch feedback modal (`UserFeedbackModal.tsx`) directly to a free Google Sheet using Google Apps Script.

---

## Step 1: Create Your Google Sheet
1. Open [Google Sheets](https://sheets.new) to create a new spreadsheet.
2. In **Row 1**, set these header column titles:
   - **Column A**: `Timestamp`
   - **Column B**: `Category`
   - **Column C**: `Message`
   - **Column D**: `Contact`
   - **Column E**: `User Address`

---

## Step 2: Add the Google Apps Script Webhook
1. In your Google Sheet, click **Extensions** $\rightarrow$ **Apps Script**.
2. Replace all existing code in the editor with this script:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Append a new row with the submitted feedback
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.category || "General",
      data.message || data.feedback || "",
      data.contact || "N/A",
      data.userAddress || "Anonymous"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## Step 3: Deploy as a Free Web App
1. Click the blue **Deploy** button (top-right) $\rightarrow$ **New deployment**.
2. Click the gear icon $\rightarrow$ select **Web app**.
3. Configure these fields:
   - **Description**: `Lumex Feedback Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Required so external evaluators and stakers can send feedback)*
4. Click **Deploy**. Authorize permissions with your Google account when prompted.
5. Copy the generated **Web App URL** (format: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## Step 4: Configure Your Environment Variable
Add the URL to your `.env` file:

```env
VITE_GOOGLE_FEEDBACK_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb.../exec
```

---

## Step 5: Test Verification
1. Open the Lumex dApp in your browser.
2. Click the **Developer Dispatch** button in the footer or navigation.
3. Fill out the rating, category, and feedback message, then click **Dispatch to Engineering Team**.
4. Check your Google Sheet — the new row will appear instantly.
