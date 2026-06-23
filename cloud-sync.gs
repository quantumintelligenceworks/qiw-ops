/**
 * QIW Ops — Team Sync backend (Google Apps Script)
 * Turns a Google Sheet into the live shared board for the QIW dashboard.
 *
 * SETUP (about 3 minutes, all in your Google account):
 *  1. Create a new Google Sheet (name it "QIW Ops Sync").
 *  2. Extensions -> Apps Script. Delete the sample code, paste ALL of this file.
 *  3. Change TOKEN below to your own secret (any random string). Keep it private.
 *  4. Deploy -> New deployment -> type "Web app".
 *       Execute as: Me     ·     Who has access: Anyone
 *     Click Deploy, authorize, and COPY the Web app URL (ends in /exec).
 *  5. In the dashboard: Sync / Export -> "Connect team sync", paste the URL and the TOKEN.
 *  Do that on each person's device (or each person on the hosted link). Done — one shared board.
 *
 * The board JSON lives in a hidden "QIW_DATA" tab; a readable "Leads" tab is rebuilt on every save.
 */

var TOKEN = 'qiw-7m3k-92xp-4a8t';  // <-- CHANGE THIS to your own secret, then re-deploy.

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.token !== TOKEN) return out_({ error: 'bad token' }, p.callback);
  return out_(read_(), p.callback);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) return out_({ error: 'bad token' });
    write_(body);
    return out_({ ok: true, ts: body.ts || Date.now() });
  } catch (err) {
    return out_({ error: String(err) });
  }
}

function read_() {
  var raw = sheet_('QIW_DATA').getRange('A1').getValue();
  if (!raw) return { leads: [], deleted: [], ts: 0 };
  try { return JSON.parse(raw); } catch (e) { return { leads: [], deleted: [], ts: 0 }; }
}

function write_(body) {
  var payload = { leads: body.leads || [], deleted: body.deleted || [], ts: body.ts || Date.now() };
  var data = sheet_('QIW_DATA');
  data.getRange('A1').setValue(JSON.stringify(payload));
  data.getRange('A2').setValue(new Date());
  mirror_(payload.leads);
}

function mirror_(leads) {
  var sh = sheet_('Leads');
  sh.clearContents();
  var cols = ['Business', 'Owner', 'Industry', 'City', 'Stage', 'Model', 'Monthly $', 'Hook', 'Phone', 'Email', 'Preview', 'Next Action', 'Notes'];
  sh.getRange(1, 1, 1, cols.length).setValues([cols]);
  if (leads && leads.length) {
    var rows = leads.map(function (l) {
      return [l.business || '', l.owner || '', l.industry || '', l.city || '', l.stage || '', l.model || '',
              l.monthly || 0, l.hook || '', l.phone || '', l.email || '', l.preview || '', l.nextAction || '', l.notes || ''];
    });
    sh.getRange(2, 1, rows.length, cols.length).setValues(rows);
  }
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function out_(obj, callback) {
  var json = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}
