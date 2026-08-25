import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, X, Check, Grid, RefreshCw } from 'lucide-react';

interface ImageUploadInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  supportPresets?: boolean;
}

const FRUIT_PRESETS = [
  { name: 'ผลไม้รวม', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80' },
  { name: 'มะม่วง', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80' },
  { name: 'ทุเรียน', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=80' },
  { name: 'มังคุด', url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&auto=format&fit=crop&q=80' },
  { name: 'ส้ม', url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80' },
  { name: 'แตงโม', url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&auto=format&fit=crop&q=80' },
  { name: 'ส้มโอ', url: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=600&auto=format&fit=crop&q=80' },
  { name: 'สตรอว์เบอร์รี่', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80' },
  { name: 'สับปะรด', url: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&auto=format&fit=crop&q=80' },
  { name: 'กล้วย', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80' },
  { name: 'มะพร้าว', url: 'https://images.unsplash.com/photo-1588615419957-662b95cb1d66?w=600&auto=format&fit=crop&q=80' },
  { name: 'แก้วมังกร', url: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&auto=format&fit=crop&q=80' },
  { name: 'แอปเปิ้ล', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80' },
  { name: 'องุ่น', url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80' },
];

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label = 'รูปภาพ (Picture)',
  required = false,
  className = '',
  supportPresets = true,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'presets' | 'url'>('file');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSizeText, setFileSizeText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress & resize image if needed, then convert to base64 Data URL
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WEBP, GIF)');
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);
    setFileSizeText(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setIsProcessing(false);
        return;
      }

      // If file size > 1MB, resize in canvas to keep payload light
      if (file.size > 1024 * 1024) {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            onChange(optimizedBase64);
          } else {
            onChange(result);
          }
          setIsProcessing(false);
        };
        img.onerror = () => {
          onChange(result);
          setIsProcessing(false);
        };
        img.src = result;
      } else {
        onChange(result);
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert('ไม่สามารถอ่านไฟล์รูปภาพได้');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleClear = () => {
    onChange('');
    setFileName('');
    setFileSizeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-700 dark:text-slate-300 text-xs">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'file'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>เลือกไฟล์ (Choose File)</span>
          </button>

          {supportPresets && (
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>ภาพตัวอย่าง</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>URL ลิงก์</span>
          </button>
        </div>
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="fruit-image-file-input"
      />

      {/* TAB 1: File Chooser / Dropzone */}
      {activeTab === 'file' && (
        <div className="space-y-3">
          {!value ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    คลิกเพื่อเลือกไฟล์รูปภาพ หรือลากไฟล์มาวางที่นี่
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    รองรับไฟล์ JPG, PNG, WEBP หรือ GIF (ขนาดไม่เกิน 10MB)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-4 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-500 transition-all shadow-xs"
                >
                  เลือกไฟล์จากเครื่อง (Browse File)
                </button>
              </div>
            </div>
          ) : (
            <div className="relative border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-800/80 flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shrink-0">
                <img
                  src={value}
                  alt="Product preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Check className="w-4 h-4" />
                  <span>เลือกรูปภาพเรียบร้อยแล้ว</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                  {fileName || 'ไฟล์รูปภาพพร้อมใช้งาน'}
                </p>
                {fileSizeText && (
                  <p className="text-[11px] text-slate-400">ขนาด: {fileSizeText}</p>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-emerald-600 transition-colors"
                  >
                    เปลี่ยนรูปภาพ
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 transition-colors"
                  >
                    ลบรูปภาพ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Fruit Presets */}
      {activeTab === 'presets' && supportPresets && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            เลือกภาพผลไม้สำเร็จรูปความละเอียดสูง:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            {FRUIT_PRESETS.map((preset, idx) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setFileName(preset.name);
                    setFileSizeText('');
                  }}
                  className={`group relative rounded-xl overflow-hidden border p-1 text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/50'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden relative">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate mt-1 text-center">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: URL Link */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="relative">
            <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="วางลิงก์รูปภาพ เช่น https://images.unsplash.com/..."
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setFileName('');
                setFileSizeText('');
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {value && (
            <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <img
                src={value}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-slate-500 text-[11px] block">แสดงตัวอย่างภาพจาก URL</span>
                <span className="text-slate-800 dark:text-slate-200 text-xs font-mono truncate block">
                  {value}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
