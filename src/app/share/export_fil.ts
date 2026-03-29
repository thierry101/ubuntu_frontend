/* eslint-disable @typescript-eslint/no-explicit-any */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { firstValueFrom, Observable } from 'rxjs';

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
  try {
    const data = await fetchDataFn(searchTermStock); // ✅ Just await the promise

    const visibleColumns = columns.filter(col => col.visible && col.key !== 'actions');
    const headers = visibleColumns.map(col => col.label);
    const rows = getExportRows(data, visibleColumns);
    const worksheetData = [headers, ...rows];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Stock': worksheet },
      SheetNames: ['Stock']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(dataBlob, `${fileName}${theDate}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
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

    doc.save(`${nameFile}_${theDate}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
  }
}

