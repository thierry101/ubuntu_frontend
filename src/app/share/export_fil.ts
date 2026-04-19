/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
// import * as FileSaver from 'file-saver';
import { firstValueFrom, Observable } from 'rxjs';
import { saveFile } from './exportFileInApp';

// Function to export all the item in excel
export async function exportToExcelAllItem({
  fetchDataFn,
  searchTermStock,
  columns,
  getExportRows,
  theDate,
  fileName = ''
}: {
  fetchDataFn: (searchTerm: any) => Promise<any[]>,
  searchTermStock: any,
  columns: any[],
  getExportRows: (data: any[], visibleColumns: any[]) => any[],
  theDate: string,
  fileName?: string
}): Promise<void> {
  const data = await fetchDataFn(searchTermStock);
  const visibleColumns = columns.filter(col => col.visible && col.key !== 'actions');
  const headers = visibleColumns.map(col => col.label);
  const rows = getExportRows(data, visibleColumns);

  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Stock': worksheet },
    SheetNames: ['Stock']
  };

  const excelBuffer: ArrayBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array' // ✅ Retourne un ArrayBuffer
  });

  const fullFileName = `${fileName}${theDate}.xlsx`;

  // ✅ Gère Web et Mobile automatiquement
  await saveFile(
    excelBuffer,
    fullFileName,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
}


// // Function to export all items in pdf
export async function exportAllOrFilterToPDF({
  fetchDataFn,
  searchTerm,
  columns,
  getExportRows,
  theDate,
  title = '',
  nameFile = ''
}: {
  fetchDataFn: (searchTerm: any) => Observable<any[]>,
  searchTerm: any,
  columns: any[],
  getExportRows: (data: any[], visibleColumns: any[]) => any[],
  theDate: string,
  title?: string,
  nameFile: string
}): Promise<void> {
  try {
    const data = await firstValueFrom(fetchDataFn(searchTerm));
    const visibleColumns = columns.filter(col => col.visible && col.key !== 'actions');
    const headers = visibleColumns.map(col => col.label);
    const rows = getExportRows(data, visibleColumns);

    const doc = new jsPDF('landscape');
    doc.setFontSize(14);
    doc.text(title, 14, 20);

    autoTable(doc, {
      startY: 25,
      head: [headers],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    const fullFileName = `${nameFile}_${theDate}.pdf`;

    // ✅ Remplace doc.save() — gère Web et Mobile automatiquement
    const pdfArrayBuffer = doc.output('arraybuffer');
    await saveFile(pdfArrayBuffer, fullFileName, 'application/pdf');

  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
}

