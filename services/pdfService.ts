
import type { AppFile } from '../types';

const { PDFDocument, rgb } = (window as any).PDFLib;

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

export const mergeFilesToPdf = async (files: AppFile[]): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();

    for (const appFile of files) {
        const file = appFile.file;
        const fileType = file.type;
        const fileBuffer = await readFileAsArrayBuffer(file);

        if (fileType === 'application/pdf') {
            const donorPdfDoc = await PDFDocument.load(fileBuffer);
            const copiedPages = await pdfDoc.copyPages(donorPdfDoc, donorPdfDoc.getPageIndices());
            copiedPages.forEach(page => pdfDoc.addPage(page));
        } else if (fileType === 'image/jpeg' || fileType === 'image/png') {
            let image;
            if (fileType === 'image/jpeg') {
                image = await pdfDoc.embedJpg(fileBuffer);
            } else {
                image = await pdfDoc.embedPng(fileBuffer);
            }

            const page = pdfDoc.addPage();
            const { width, height } = image.scale(1);
            
            const pageWidth = page.getWidth();
            const pageHeight = page.getHeight();
            
            const scale = Math.min(pageWidth / width, pageHeight / height);
            const scaledWidth = width * scale;
            const scaledHeight = height * scale;

            page.drawImage(image, {
                x: (pageWidth - scaledWidth) / 2,
                y: (pageHeight - scaledHeight) / 2,
                width: scaledWidth,
                height: scaledHeight,
            });
        } else {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
    }

    return await pdfDoc.save();
};
