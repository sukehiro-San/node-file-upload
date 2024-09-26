const cors = require("cors");
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  }
}) });
app.use(cors({
  origin:"*"
}))

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (req.file) {
    const chunks = [];
    const chunkSize = 1024 * 1024; // 1MB

    const readStream = fs.createReadStream(req.file.path);
    readStream.on('data', chunk => chunks.push(chunk));
    readStream.on('end', async () => {
      const mergedData = Buffer.concat(chunks);

      const mergedFilePath = path.join('./uploads', `merged-file.${req.file.originalname.split('.').pop()}`);

      try {
        await fs.writeFile(mergedFilePath, mergedData);
        await fs.unlink(req.file.path); // Delete the original file
        res.send({ message: 'File uploaded and merged successfully' });
      } catch (error) {
        console.error('Error writing merged data or deleting original file:', error);
        res.status(500).send({ error: 'Failed to process file' });
      }
    });
  } else {
    res.status(400).send({ error: 'No file uploaded' });
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});