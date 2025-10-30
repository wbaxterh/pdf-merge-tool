import React, { useCallback, useRef } from 'react';

interface FileUploadProps {
    onFilesAdded: (files: File[]) => void;
    isSecondary?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesAdded, isSecondary = false }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            // FIX: Explicitly type `file` as File to resolve type inference issue.
            const files = Array.from(event.target.files).filter((file: File) => validTypes.includes(file.type));
            onFilesAdded(files);
            // Reset input value to allow re-uploading the same file
            event.target.value = '';
        }
    };

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files) {
            // FIX: Explicitly type `file` as File to resolve type inference issue.
            const files = Array.from(event.dataTransfer.files).filter((file: File) => validTypes.includes(file.type));
            onFilesAdded(files);
        }
    }, [onFilesAdded]);
    
    const handleClick = () => {
        inputRef.current?.click();
    };

    if (isSecondary) {
      return (
        <div className="pt-4 mt-auto border-t border-gray-700">
           <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf, .jpg, .jpeg, .png"
                onChange={handleFileChange}
                className="hidden"
            />
          <button
              onClick={handleClick}
              className="w-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 font-semibold py-3 px-4 rounded-lg transition-colors duration-300"
          >
              Add More Files
          </button>
        </div>
      );
    }

    return (
        <div onDragOver={handleDragOver} onDrop={handleDrop}>
            <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf, .jpg, .jpeg, .png"
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={handleClick}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
                Or select files
            </button>
        </div>
    );
};

export default FileUpload;