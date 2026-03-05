import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const ML_DIR = path.resolve(process.cwd(), '../../ml');
const DATA_DIR = path.resolve(process.cwd(), '../../backend/data');
const UPLOADS_DIR = path.resolve(process.cwd(), '../../backend/uploads');
// Use the full path to the venv Python executable
const PYTHON_PATH = path.resolve(process.cwd(), '../../.venv/Scripts/python.exe');

// ADMIN: Upload dataset and train model
export const adminUploadDataset = [
  (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    next();
  },
  async (req, res) => {
    try {
      // Save uploaded file to data dir
      const destPath = path.join(DATA_DIR, req.file.originalname);
      fs.renameSync(req.file.path, destPath);
      res.json({ success: true, message: 'Dataset uploaded', file: req.file.originalname });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
];

// ADMIN: Train model
export const adminTrainModel = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ success: false, message: 'No dataset filename provided' });
    const datasetPath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(datasetPath)) return res.status(404).json({ success: false, message: 'Dataset not found' });
    const py = spawn(PYTHON_PATH, [path.join(ML_DIR, 'train_model.py'), datasetPath]);
    let output = '';
    py.stdout.on('data', (data) => { output += data.toString(); });
    py.stderr.on('data', (data) => { output += data.toString(); });
    py.on('close', (code) => {
      if (code === 0) {
        res.json({ success: true, message: 'Model trained', output });
      } else {
        res.status(500).json({ success: false, message: 'Training failed', output });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Batch prediction
export const adminBatchPredict = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ success: false, message: 'No dataset filename provided' });
    const datasetPath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(datasetPath)) return res.status(404).json({ success: false, message: 'Dataset not found' });
    const py = spawn(PYTHON_PATH, [path.join(ML_DIR, 'predict.py'), datasetPath]);
    let output = '';
    py.stdout.on('data', (data) => { output += data.toString(); });
    py.stderr.on('data', (data) => { output += data.toString(); });
    py.on('close', (code) => {
      if (code === 0) {
        // Parse output into array
        const results = output.trim().split('\n').map(line => {
          const [name, pred, proba] = line.split(',');
          return { name, prediction: pred === '1' ? 'Likely to Churn' : 'Not Likely to Churn', probability: Number(proba) };
        });
        res.json({ success: true, results });
      } else {
        res.status(500).json({ success: false, message: 'Batch prediction failed', output });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Prediction summary
export const adminPredictionSummary = async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ success: false, message: 'No dataset filename provided' });
    const datasetPath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(datasetPath)) return res.status(404).json({ success: false, message: 'Dataset not found' });
    const py = spawn(PYTHON_PATH, [path.join(ML_DIR, 'predict.py'), datasetPath]);
    let output = '';
    py.stdout.on('data', (data) => { output += data.toString(); });
    py.stderr.on('data', (data) => { output += data.toString(); });
    py.on('close', (code) => {
      if (code === 0) {
        const results = output.trim().split('\n').map(line => {
          const [name, pred, proba] = line.split(',');
          return { name, prediction: pred === '1' ? 'Likely to Churn' : 'Not Likely to Churn', probability: Number(proba) };
        });
        const total = results.length;
        const churn = results.filter(r => r.prediction === 'Likely to Churn').length;
        const notChurn = total - churn;
        res.json({ success: true, summary: { total, churn, notChurn }, results });
      } else {
        res.status(500).json({ success: false, message: 'Summary failed', output });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// BANK: Single prediction
export const bankSinglePredict = async (req, res) => {
  try {
    const input = req.body;
    const py = spawn(PYTHON_PATH, [path.join(ML_DIR, 'predict.py'), '-'], { stdio: ['pipe', 'pipe', 'pipe'] });
    py.stdin.write(JSON.stringify(input));
    py.stdin.end();
    let output = '';
    py.stdout.on('data', (data) => { output += data.toString(); });
    py.stderr.on('data', (data) => { output += data.toString(); });
    py.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          res.json({ success: true, prediction: result.prediction === 1 ? 'Likely to Churn' : 'Not Likely to Churn', probability: result.probability });
        } catch (e) {
          res.status(500).json({ success: false, message: 'Invalid prediction output', output });
        }
      } else {
        res.status(500).json({ success: false, message: 'Prediction failed', output });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// BANK: Batch prediction
export const bankBatchPredict = async (req, res) => {
  try {
    const { filename } = req.body;
    const csvPath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(csvPath)) return res.status(404).json({ success: false, message: 'CSV not found' });
    const py = spawn('python', [path.join(ML_DIR, 'predict.py'), csvPath]);
    let output = '';
    py.stdout.on('data', (data) => { output += data.toString(); });
    py.stderr.on('data', (data) => { output += data.toString(); });
    py.on('close', (code) => {
      if (code === 0) {
        const results = output.trim().split('\n').map(line => {
          const [name, pred, proba] = line.split(',');
          return { name, prediction: pred === '1' ? 'Likely to Churn' : 'Not Likely to Churn', probability: Number(proba) };
        });
        res.json({ success: true, results });
      } else {
        res.status(500).json({ success: false, message: 'Batch prediction failed', output });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
