const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const pdfParse = require('pdf-parse');

// PDF verileri
async function extractValuesFromPDF(pdfBuffer) {
  try {
    const data = await pdfParse(pdfBuffer);
    const text = data.text;

    const results = {};

    // "Toplam" veya "Total" terimini arıyoruz
    const totalLine = text.match(/(?:Toplam|Total)[^\d]*(\d+[.,]?\d*)/i);
    results.total = totalLine ? totalLine[1] : null;

    // KDV veya VAT tutarını arıyoruz
    const vatLine = text.match(/(?:KDV|VAT)[^\d]*(\d+[.,]?\d*)/i);
    results.vat = vatLine ? vatLine[1] : null;

    // Fatura Tarihi veya Invoice Date arıyoruz
    const invoiceDateLine = text.match(/(?:Fatura Tarihi|Invoice Date)[^\d]*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4})/i);
    results.invoiceDate = invoiceDateLine ? invoiceDateLine[1] : null;

    // Fatura Belge No veya Invoice Document No arıyoruz
    const invoiceDocNoLine = text.match(/(?:Fatura Belge|Document No)[^\d]*(\d+[\w-]*)/i);
    results.invoiceDocNo = invoiceDocNoLine ? invoiceDocNoLine[1] : null;

    return results;
  } catch (error) {
    console.error('PDF verisi çıkarılırken hata oluştu:', error);
    return null;
  }
}

function getOrCreateExcelFile(filePath) {
  if (fs.existsSync(filePath)) {
    return XLSX.readFile(filePath);  // Dosya mevcutsa aç
  } else {
    const ws_data = [
      ["Fatura No", "Fatura Tarihi", "Gönderen VKN", "Gönderen Unvanı", "Tutar", "KDV(%20)", "Tip"]
    ];
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faturalar");
    XLSX.writeFile(wb, filePath);
    return wb;
  }
}

function appendRowToExcel(filePath, rowData) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];

  const row = XLSX.utils.aoa_to_sheet([rowData], { origin: -1 });
  XLSX.utils.sheet_add_json(ws, [rowData], { origin: -1, skipHeader: true });

  XLSX.writeFile(wb, filePath);  // Dosyayı kaydediyoruz
}

// Base64'ten ArrayBuffer'a çevir
function decodeBase64ToArrayBuffer(base64) {
  const binaryString = Buffer.from(base64, 'base64').toString('binary');
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
}

async function processExcelFile(filePath) {
  console.log(`İşlem başlatılıyor: ${filePath}`);
  
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 1 });

    let PNRList = new Set();
    let surNames = [];
    
    data.forEach((row) => {
      if (row[4] && row[7]) {
        const PNR = row[4];
        const [lastName, firstName] = row[7].split('/');
        
        if (!PNRList.has(PNR)) {
          PNRList.add(PNR);
          surNames.push(lastName.trim().toUpperCase());
        }
      }
    });
	
    // Excel dosyasının yolu
    const outputExcelPath = path.join(__dirname, 'faturalar', 'faturalar.xlsx');
    let wb = getOrCreateExcelFile(outputExcelPath);

    for (let i = 0; i < PNRList.size; i++) {
      const PNR = Array.from(PNRList)[i];
      const surName = surNames[i];
      
      try {
        const ticketResponse = await fetch(`https://ebilet.fitbulut.com/ETIC_WEB_REST_10/rest/Customer/getTicketList?senderID=4340050485&PNR=${PNR}&surName=${surName}`);
        const ticketData = await ticketResponse.json();

        if (!ticketData.ticketInformation || ticketData.ticketInformation.length === 0) {
          console.error(`PNR ${PNR} için fatura bilgisi bulunamadı.`);
          continue;
        }

        ticketData.ticketInformation.forEach(async (ticket) => {
          const uuid = ticket.uuid;
          const viewResponse = await fetch(`https://ebilet.fitbulut.com/ETIC_WEB_REST_10/rest/Customer/getView?UUID=${uuid}`);
          const viewData = await viewResponse.json();

          if (!viewData.binaryData) {
            console.error(`UUID ${uuid} için PDF bulunamadı.`);
            return;
          }

          const binaryData = viewData.binaryData;
          const pdfData = decodeBase64ToArrayBuffer(binaryData);

          const extractedPDFData = await extractValuesFromPDF(pdfData);
          
          if (extractedPDFData) {
            const newRow = [
              extractedPDFData.invoiceDocNo,                     // Fatura No
              extractedPDFData.invoiceDate,        // Fatura Tarihi
              '4340050485',                        // Gönderen VKN
              'Güneş Ekspres Havacılık A.Ş',       // Gönderen Unvanı
              extractedPDFData.total,              // Tutar
              extractedPDFData.vat,                // KDV(%20)
              ticket.ticketType                    // Tip
            ];

            appendRowToExcel(outputExcelPath, newRow);
          }
          
          await delay(2000 + Math.random() * 1000);  // 2-3 saniye bekleme
        });
        
      } catch (error) {
        console.error(`PNR ${PNR} API hatası: ${error}`);
      }
    }
    
    fs.unlinkSync(filePath);
    console.log(`Dosya silindi: ${filePath}`);
  } catch (error) {
    console.error(`Excel dosyasını okurken hata: ${error}`);
  }
}

// sleep 
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function processAllExcelFiles() {
  const excelDir = path.join(__dirname, 'excel');
  const files = fs.readdirSync(excelDir);
  const excelFiles = files.filter(file => file.endsWith('.xls') || file.endsWith('.xlsx'));

  for (const excelFile of excelFiles) {
    const filePath = path.join(excelDir, excelFile);
    await processExcelFile(filePath);
  }
}

processAllExcelFiles();
