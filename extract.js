const tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const express = require('express');

const multer  = require('multer');
const cors = require('cors');

const corsOptions = {
  origin: '*',  // Explicitly allow your React frontend's origin
  credentials: true,  // Allow sending credentials (cookies, authorization headers, etc.)
};

// const upload = multer({ dest: 'uploads/' });
const app = express()
app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({extended : false}));
const port = 3000

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
      return cb(null, file.originalname);
    }
  })
  
const upload = multer({ storage: storage })

// Define a function to extract text from image
async function extractTextWithTesseract(imagePath) {
    try {
      const result = await tesseract.recognize(
        imagePath,
        'eng',  // Language code (English)
        {
          logger: (m) => console.log(m), // Logs progress of OCR
        }
      );
      
      return result.data.text;  // Return the extracted text
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;  // Propagate the error if needed
    }
}

//delete file after extraction
function deleteFilesInFolderSync(folderPath) {
    try {
      const files = fs.readdirSync(folderPath);
  
      files.forEach(file => {
        const filePath = path.join(folderPath, file);
        
        // Check if the item is a file (not a directory)
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          fs.unlinkSync(filePath);
          console.log(`Deleted: ${filePath}`);
        }
      });
    } catch (err) {
      console.error('Error:', err);
    }
}

app.get('/test', async(req,res) => {
  return res.json("Machine is running");
})

app.post('/extract', upload.single('imgsrc'),  async(req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
    const src = `./uploads/${req.file?.originalname}`;
    data = await extractTextWithTesseract(src);
    if(data){
        deleteFilesInFolderSync('./uploads');
    }
    console.log(req.file.originalname);
    return res.json({ "text": data});
    }catch(error){
      res.status(500).json({ error: 'Error processing the image' });
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})



