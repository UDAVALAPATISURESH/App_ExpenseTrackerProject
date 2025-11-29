const path = require("path");
const dataService = require("../services/getDataForDay");
const AWS = require("aws-sdk");
const FileDownloaded = require("../models/filedownloaded");

// Serve the reports page
const getReportsPage = (req, res, next) => {
  res.sendFile(
    path.join(__dirname, "../", "public", "views", "reports.html")
  );
};

// Upload data to S3
function uploadToS3(data, fileName) {
  // Check if AWS credentials are configured
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.BUCKET_NAME) {
    throw new Error("AWS S3 credentials are not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and BUCKET_NAME in your .env file.");
  }

  let s3Bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: fileName,
    Body: data,
    ACL: "public-read",
  };
  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3res) => {
      if (err) {
        reject(err);
      } else {
        resolve(s3res.Location);
      }
    });
  });
}

// Generate daily report
const dailyReports = async (req, res) => {
  try {
    const date = req.body.date;
    const expenses = await dataService.getDataForToday(date, req.user.id);
    return res.status(200).json({ expenses, success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Generate monthly report
const monthlyReports = async (req, res) => {
  try {
    const month = req.body.month || req.query.month;
    if (!month) {
      return res
        .status(400)
        .json({ success: false, message: "Month and year are required" });
    }
    const expenses = await dataService.getDataForMonth(month, req.user.id);
    return res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Download daily expenses file
const downloadDailyReports = async (req, res) => {
  try {
    const date = req.query.date;
    const userId = req.user.id;
    if (!date || !userId) {
      return res
        .status(400)
        .json({ message: "Date and user ID are required", success: false });
    }

    const expenses = await dataService.getDataForToday(date, req.user.id);
    
    // Check if expenses is valid array
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "No expenses found for the selected date", success: false });
    }

    const stringifyExpenses = JSON.stringify(expenses, null, 2);
    
    // Create a proper filename with date format (YYYY-MM-DD_HH-MM-SS)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `Expense${userId}/daily_${date}_${timestamp}.txt`;

    try {
      const fileUrl = await uploadToS3(stringifyExpenses, fileName);

      // Save to filedownloaded collection
      try {
        await FileDownloaded.create({
          userId,
          filedownloadurl: fileUrl,
        });
      } catch (dbError) {
        console.error("Error saving to FileDownloaded table:", dbError);
        // Continue even if database save fails - file is still uploaded to S3
      }

      return res.status(200).json({ fileUrl, success: true, message: "File downloaded successfully" });
    } catch (s3Error) {
      // If S3 upload fails, return the data directly as a downloadable response
      console.error("S3 upload failed, returning data directly:", s3Error.message);
      
      // Don't set headers if response already sent, just return JSON with data
      const localFileUrl = `${req.protocol}://${req.get('host')}/reports/dailyReports/download?date=${date}&direct=true`;
      
      return res.status(200).json({ 
        fileUrl: localFileUrl, 
        success: true, 
        message: "File generated (S3 not configured, using direct download)",
        data: stringifyExpenses 
      });
    }
  } catch (error) {
    console.error("Error in downloadDailyReports:", error);
    res.status(500).json({ 
      message: error.message || "Internal server error", 
      fileUrl: "", 
      success: false 
    });
  }
};

// Download monthly expenses file
const downloadMonthlyReports = async (req, res) => {
  try {
    const month = req.body.month || req.query.month;
    const userId = req.user.id;
    
    if (!month) {
      return res
        .status(400)
        .json({ success: false, message: "Month and year are required" });
    }
    
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }
    
    const expenses = await dataService.getDataForMonth(month, userId);
    
    // Check if expenses is valid array
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No expenses found for the selected month" });
    }
    
    const stringifyExpenses = JSON.stringify(expenses, null, 2);

    // Create a proper filename with date format
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `Expense${userId}/monthly_${month}_${timestamp}.txt`;

    try {
      const fileUrl = await uploadToS3(stringifyExpenses, fileName);

      // Save to filedownloaded collection
      try {
        await FileDownloaded.create({
          userId,
          filedownloadurl: fileUrl,
        });
      } catch (dbError) {
        console.error("Error saving to FileDownloaded table:", dbError);
        // Continue even if database save fails - file is still uploaded to S3
      }

      return res.status(200).json({ fileUrl, success: true, message: "File downloaded successfully" });
    } catch (s3Error) {
      // If S3 upload fails, return the data directly as a downloadable response
      console.error("S3 upload failed, returning data directly:", s3Error.message);
      
      // Don't set headers if response already sent, just return JSON with data
      const localFileUrl = `${req.protocol}://${req.get('host')}/reports/monthlyReports/download?month=${month}&direct=true`;
      
      return res.status(200).json({ 
        fileUrl: localFileUrl, 
        success: true, 
        message: "File generated (S3 not configured, using direct download)",
        data: stringifyExpenses 
      });
    }
  } catch (error) {
    console.error("Error in downloadMonthlyReports:", error);
    const errorMessage = error.message || "Internal server error";
    res.status(500).json({ 
      message: errorMessage, 
      fileUrl: "", 
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Fetch list of downloaded files
const downloadFiles = async (req, res) => {
  try {
    const files = await FileDownloaded.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return res.status(200).json({ success: true, files });
  } catch (error) {
    return res.status(500).json({ success: false, err: error });
  }
};

module.exports = {
  getReportsPage,
  dailyReports,
  monthlyReports,
  downloadDailyReports,
  downloadMonthlyReports,
  downloadFiles,
};