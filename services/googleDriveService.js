const { google } = require('googleapis');

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

async function ensureFolder(name, parentId) {
  const q = `mimeType='application/vnd.google-apps.folder' and name='${name}' and '${parentId}' in parents and trashed=false`;
  const found = await drive.files.list({ q, fields: 'files(id,name)' });
  if (found.data.files.length) return found.data.files[0].id;
  const created = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id'
  });
  return created.data.id;
}

async function uploadToDrive({ file, rombelId, studentId, dateKey }) {
  const root = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const rombelFolder = await ensureFolder(`Rombel_${rombelId}`, root);
  const dateFolder = await ensureFolder(dateKey, rombelFolder);
  const studentFolder = await ensureFolder(String(studentId), dateFolder);

  const upload = await drive.files.create({
    requestBody: { name: `${Date.now()}_${file.originalname}`, parents: [studentFolder] },
    media: { mimeType: file.mimetype, body: require('stream').Readable.from(file.buffer) },
    fields: 'id, webViewLink'
  });

  await drive.permissions.create({ fileId: upload.data.id, requestBody: { role: 'reader', type: 'anyone' } });
  const link = await drive.files.get({ fileId: upload.data.id, fields: 'id,webViewLink' });
  return link.data;
}

module.exports = { uploadToDrive };
