import { CheckCircle2, Download, Printer, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import React, { useRef } from "react";

interface SelectedItemProps {
  newItem: any;
  selectedItem: any;
  onClose: () => void;
}

const SelectedItem = ({
  newItem,
  selectedItem,
  onClose,
}: SelectedItemProps) => {
  if (!newItem && !selectedItem) return null;

  const item = selectedItem || newItem;

  const qrContainerRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    // ۲. پیدا کردن SVG از طریق رفرنس (بدون نیاز به ID)
    const svgElement = qrContainerRef.current?.querySelector(
      "svg",
    ) as SVGSVGElement;

    if (!svgElement) {
      alert("خطا: کد QR یافت نشد. لطفاً دوباره تلاش کنید.");
      return;
    }

    // بقیه کد دانلود...
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 1000, 1000);
      }
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${item.name}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const printQR = () => {
    window.print(); // باز کردن منوی چاپ مرورگر
  };
  return (
    <>
      {item && (
        <div className="mt-8 bg-neutral-700 p-8 rounded-2xl shadow-xl border-2 border-green-100 flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          {newItem && (
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-bold text-lg">
                Registered Successfully!
              </span>
            </div>
          )}

          <div className="flex gap-4 mb-6">
            {/* دکمه دانلود */}
            <button
              onClick={downloadQR}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              <Download size={18} /> Download PNG
            </button>

            {/* دکمه چاپ مستقیم */}
            <button
              onClick={printQR}
              className="flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
            >
              <Printer size={18} /> Print Label
            </button>
          </div>
          <div
            className="bg-white p-4 rounded-xl border-4 border-slate-800"
            ref={qrContainerRef}
          >
            <QRCodeSVG
              value={`${window.location.origin}/item/${item?.id}`}
              size={200}
              level={"H"}
            />
          </div>

          <p className="mt-4 text-slate-200 font-medium">{item?.name}</p>
          <p className="text-xs text-slate-300 mt-1">
            Print this QR and attach it to your item
          </p>
        </div>
      )}
    </>
  );
};

export default SelectedItem;
