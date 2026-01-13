import * as pdfjsLib from 'pdfjs-dist';

// Use a consistent version for both library and worker
const PDFJS_VERSION = '4.4.168';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
};

const parsePdf = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  try {
    const loadingTask = pdfjsLib.getDocument({ 
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      isEvalSupported: false,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Better text concatenation handling positions/newlines
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText.trim();
  } catch (err) {
    console.error("PDF.js parsing error:", err);
    throw new Error("Failed to parse PDF document. It might be password-protected or corrupted.");
  }
};

const parseDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const mammoth = (window as any).mammoth;
    if (!mammoth) throw new Error("Mammoth.js library is not loaded.");
    try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    } catch (err) {
        throw new Error("Failed to parse Word document.");
    }
};

const parseXlsx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const XLSX = (window as any).XLSX;
    if (!XLSX) throw new Error("XLSX (SheetJS) library is not loaded.");
    try {
        const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
        let fullText = '';
        workbook.SheetNames.forEach((sheetName: string) => {
            const worksheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            fullText += `Sheet: ${sheetName}\n\n${csv}\n\n`;
        });
        return fullText;
    } catch (err) {
        throw new Error("Failed to parse Excel document.");
    }
};

/**
 * Main entry point for parsing any supported financial document.
 * Returns the extracted text.
 */
export const parseFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (!extension) throw new Error("File has no extension.");

  try {
    if (extension === 'pdf') {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      return await parsePdf(arrayBuffer);
    } else if (extension === 'docx') {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      return await parseDocx(arrayBuffer);
    } else if (extension === 'xlsx' || extension === 'xls') {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      return await parseXlsx(arrayBuffer);
    } else if (['csv', 'txt'].includes(extension)) {
      return await readFileAsText(file);
    } else {
      throw new Error(`Unsupported file type: .${extension}`);
    }
  } catch (err) {
    console.error(`Error parsing file ${file.name}:`, err);
    if (err instanceof Error) throw err;
    throw new Error(`Failed to read or parse the file.`);
  }
};

/**
 * Converts a file to base64 for direct Gemini multimodal analysis if text extraction fails.
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};
