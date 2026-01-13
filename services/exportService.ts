// Declare global variables from CDN scripts to inform TypeScript
declare const html2canvas: any;
declare const jspdf: any;
declare const htmlToDocx: any;

/**
 * Captures an HTML element and returns a PNG image as a data URL.
 * @param element The HTMLElement to capture.
 * @returns A promise that resolves with the data URL of the captured image.
 */
const captureDashboard = async (element: HTMLElement): Promise<string> => {
  // Temporarily remove shadow to improve capture quality, as shadows can render inconsistently.
  const originalShadow = element.style.boxShadow;
  element.style.boxShadow = 'none';

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Use a higher scale for better resolution in the output.
      useCORS: true,
      backgroundColor: '#F5F5F0', // Match the dashboard's background color.
    });
    return canvas.toDataURL('image/png', 1.0);
  } finally {
    // Restore the original shadow style after the capture is complete.
    element.style.boxShadow = originalShadow;
  }
};

/**
 * Exports the captured element as a PNG file.
 * @param element The HTMLElement to export.
 * @param filename The desired filename for the downloaded file (without extension).
 */
export const exportAsPNG = async (element: HTMLElement, filename: string): Promise<void> => {
  const dataUrl = await captureDashboard(element);
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports the captured element as a PDF file.
 * @param element The HTMLElement to export.
 * @param filename The desired filename for the downloaded file (without extension).
 */
export const exportAsPDF = async (element: HTMLElement, filename: string): Promise<void> => {
  const dataUrl = await captureDashboard(element);
  const { jsPDF } = jspdf;
  
  // Create a PDF with dimensions matching the captured element.
  const pdf = new jsPDF({
    orientation: element.offsetWidth > element.offsetHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [element.offsetWidth, element.offsetHeight],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
  pdf.save(`${filename}.pdf`);
};

/**
 * Exports the captured element as a Word (.docx) file.
 * @param element The HTMLElement to export.
 * @param filename The desired filename for the downloaded file (without extension).
 */
export const exportAsDOCX = async (element: HTMLElement, filename: string): Promise<void> => {
  const dataUrl = await captureDashboard(element);
  
  // Create a simple HTML string containing the captured image.
  const htmlString = `<!DOCTYPE html>
    <html>
      <head><title>${filename}</title></head>
      <body><img src="${dataUrl}" style="width:100%;" /></body>
    </html>`;
  
  const fileBuffer = await htmlToDocx(htmlString, null, {
    orientation: element.offsetWidth > element.offsetHeight ? 'landscape' : 'portrait',
    margins: {
      top: 720, // Corresponds to 1 inch
      right: 720,
      bottom: 720,
      left: 720,
    },
  });

  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
