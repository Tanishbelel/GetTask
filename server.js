// const express = require('express');
// const multer = require('multer');
// const cors = require('cors');
// const { GoogleSpreadsheet } = require('google-spreadsheet');
// const creds = require('./credentials.json'); // Downloaded from Google Cloud

// const app = express();
// const PORT = 5000;
// app.use(cors());

// const storage = multer.diskStorage({
//   destination: './uploads',
//   filename: (req, file, cb) => {
//     const timestamp = Date.now();
//     cb(null, `${timestamp}-${file.originalname}`);
//   }
// });
// const upload = multer({ storage });

// app.post('/upload', upload.single('taskFile'), async (req, res) => {
//   const { studentEmail, taskTitle } = req.body;
//   const fileName = req.file.filename;
//   const filePath = `uploads/${fileName}`;
//   const axios = require('axios');
//   try {
//     await axios.post('https://sheetdb.io/api/v1/foiu7rruugfbp', {
//       data: {
//         Email: studentEmail,
//         Task: taskTitle,
//         FileName: fileName,
//         FilePath: filePath,
//         UploadedAt: new Date().toLocaleString()
//       }
//     });

//     res.status(200).json({ message: 'Upload successful', fileURL: filePath });
//   } catch (err) {
//     console.error('Error sending to Google Sheets:', err.message);
//     res.status(500).json({ error: 'Upload succeeded but Sheet update failed' });
//   }
// });



const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Multer config for local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Your SheetDB API
const SHEETDB_API_URL = 'https://sheetdb.io/api/v1/foiu7rruugfbp';

app.post('/upload', upload.single('taskFile'), async (req, res) => {
  try {
    const { studentEmail, taskTitle, weekNumber } = req.body;
    const filePath = req.file?.path || '';
    const originalName = req.file?.originalname || '';

   const payload = {
  data: {
    Email: studentEmail || 'N/A',
    Task: taskTitle || 'N/A',
    Week: weekNumber || 'N/A',
    FileName: originalName || 'N/A',
    FilePath: filePath || 'N/A',
    UploadedAt: new Date().toLocaleString()
  }
};


    console.log('SheetDB Payload:', payload);

    const sheetRes = await axios.post(SHEETDB_API_URL, payload);

    if (sheetRes.status === 201 || sheetRes.status === 200) {
      console.log("✅ Data added to SheetDB");
      res.json({
        success: true,
        message: 'File uploaded & data added to sheet!',
        fileName: originalName,
        filePath: filePath
      });
    } else {
      throw new Error("❌ SheetDB failed");
    }
  } catch (err) {
    console.error("Error uploading:", err.message);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
