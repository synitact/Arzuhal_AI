import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ProjectInfo, PetitionOutput } from '../types';

export interface GeneratePdfOptions {
  projectInfo?: ProjectInfo;
  petitionOutput?: PetitionOutput | null;
  element?: HTMLElement | null;
  fileName?: string;
}

/**
 * Generates and downloads a high-fidelity official Court Petition PDF.
 * Uses html2canvas for crisp typography and full Turkish character support,
 * with graceful multi-page slicing or standard A4 formatting.
 */
export async function downloadPetitionPdf({
  projectInfo,
  petitionOutput,
  element,
  fileName,
}: GeneratePdfOptions): Promise<void> {
  const defaultFileName = `Aile_Mahkemesi_Dilekce_${
    projectInfo?.davaciAdi?.trim().replace(/\s+/g, '_') || 'Projesi'
  }_${new Date().toISOString().slice(0, 10)}.pdf`;

  const finalFileName = fileName || defaultFileName;

  // Case 1: If an element is provided, capture it directly with html2canvas
  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for crystal clear text
        useCORS: true,
        logging: false,
        backgroundColor: '#FAF9F5',
        windowWidth: 800,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        // Fits in 1 page
        const imgData = canvas.toDataURL('image/jpeg', 0.96);
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      } else {
        // Multi-page splitting
        let remainingHeight = imgHeight;
        let position = 0;
        const pageCanvasHeight = (canvas.width * pageHeight) / pageWidth;

        while (remainingHeight > 0) {
          const imgData = canvas.toDataURL('image/jpeg', 0.96);
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          remainingHeight -= pageHeight;
          position -= pageHeight;
          if (remainingHeight > 0) {
            pdf.addPage();
          }
        }
      }

      pdf.save(finalFileName);
      return;
    } catch (err) {
      console.warn('Canvas PDF generation failed, falling back to clean template generator:', err);
    }
  }

  // Case 2: Standalone Pristine DOM Template creation & export
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.top = '-9999px';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = '794px'; // Standard A4 at 96 DPI
  tempContainer.style.backgroundColor = '#FFFFFF';
  tempContainer.style.color = '#111827';
  tempContainer.style.fontFamily = "'Times New Roman', Times, serif";
  tempContainer.style.padding = '48px 56px';
  tempContainer.style.boxSizing = 'border-box';
  tempContainer.style.zIndex = '-1000';

  const courtCity = projectInfo?.sehir ? projectInfo.sehir.toUpperCase() : 'İSTANBUL';
  const petitionText = petitionOutput?.sectionB?.content || 'Dilekçe metni bulunamadı.';
  const davaciName = projectInfo?.davaciAdi || 'DAVACI';
  const currentDate = new Date().toLocaleDateString('tr-TR');

  tempContainer.innerHTML = `
    <div style="border-bottom: 2px solid #800000; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start;">
      <div style="display: flex; gap: 14px; align-items: center;">
        <div style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #800000; background: #FFF5F5; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #800000; font-weight: bold; font-size: 11px;">
          <span>T.C.</span>
          <span style="font-size: 14px; line-height: 1;">⚖️</span>
        </div>
        <div>
          <div style="font-size: 15px; font-weight: bold; color: #800000; text-transform: uppercase;">
            T.C. ${courtCity} AİLE MAHKEMESİ
          </div>
          <div style="font-size: 11px; font-family: sans-serif; color: #4B5563; margin-top: 2px;">
            Adalet Bakanlığı UYAP Bilişim Sistemi Dilekçe Projesi
          </div>
        </div>
      </div>
      <div style="text-align: right; font-family: monospace; font-size: 10px; color: #4B5563;">
        <div>Evrak Kodu: EVK-2026-D${Math.floor(1000 + Math.random() * 9000)}</div>
        <div style="margin-top: 2px;">Tarih: ${currentDate}</div>
      </div>
    </div>

    <div style="text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 28px; text-transform: uppercase; line-height: 1.5; color: #111;">
      T.C.<br />
      ${courtCity} AİLE MAHKEMESİ HAKİMLİĞİ'NE
    </div>

    <div style="font-size: 12.5px; line-height: 1.7; text-align: justify; white-space: pre-wrap; color: #111; margin-bottom: 40px;">
      ${petitionText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: flex-end; font-family: sans-serif; font-size: 11px;">
      <div style="color: #6B7280;">
        <div style="font-weight: bold; color: #374151; margin-bottom: 2px;">EKLER VE BELGELER:</div>
        <div>1. Nüfus kayıt örneği ve kimlik fotokopisi</div>
        <div>2. Varsa iddiaları ispata yarar yazılı deliller</div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: bold; color: #111827; font-size: 12px;">DAVACI</div>
        <div style="color: #374151; font-weight: 600; margin-top: 2px;">${davaciName}</div>
        <div style="margin-top: 25px; width: 140px; border-bottom: 1px dashed #9CA3AF; margin-left: auto;"></div>
        <div style="color: #9CA3AF; font-size: 10px; font-style: italic; margin-top: 2px;">Islak İmza / E-İmza</div>
      </div>
    </div>

    <div style="margin-top: 32px; padding-top: 10px; border-top: 1px solid #D1D5DB; text-align: center; font-family: sans-serif; font-size: 9.5px; color: #9CA3AF;">
      T.C. Adalet Bakanlığı UYAP Bilişim Sistemi Standartlarında Dijital Aile Mahkemesi Asistanı Tarafından Üretilmiştir.
    </div>
  `;

  document.body.appendChild(tempContainer);

  try {
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      let remainingHeight = imgHeight;
      let position = 0;
      while (remainingHeight > 0) {
        const imgData = canvas.toDataURL('image/jpeg', 0.96);
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
        position -= pageHeight;
        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    pdf.save(finalFileName);
  } finally {
    document.body.removeChild(tempContainer);
  }
}
