import React, { useState, useCallback } from 'react';
import { produce } from 'immer';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// The 'file-saver' library is loaded via a <script> tag in index.html,
// which makes `saveAs` available as a global function. We declare it here
// to inform TypeScript about its existence.
declare const saveAs: (data: Blob | string, filename?: string, options?: object) => void;

import type { AppFile } from './types';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import { mergeFilesToPdf } from './services/pdfService';
import { UploadCloudIcon } from './constants';
import Spinner from './components/Spinner';

const App: React.FC = () => {
    const [files, setFiles] = useState<AppFile[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFilesAdded = (newFiles: File[]) => {
        setError(null);
        const appFiles: AppFile[] = newFiles.map(file => ({
            id: `${file.name}-${file.lastModified}-${Math.random()}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }));
        setFiles(prev => [...prev, ...appFiles]);
    };

    const handleRemoveFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleClearAll = () => {
        files.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setFiles([]);
    };
    
    const moveFile = useCallback((dragIndex: number, hoverIndex: number) => {
      setFiles((prevFiles) =>
        produce(prevFiles, (draft) => {
          const [removed] = draft.splice(dragIndex, 1);
          draft.splice(hoverIndex, 0, removed);
        })
      );
    }, []);

    const handleMerge = async () => {
        if (files.length < 1) {
            setError("Please add at least one file to merge.");
            return;
        }
        setIsMerging(true);
        setError(null);
        try {
            const pdfBytes = await mergeFilesToPdf(files);
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `merged-document-${Date.now()}.pdf`);
        } catch (err) {
            console.error("Merging failed:", err);
            setError(err instanceof Error ? err.message : "An unknown error occurred during merging.");
        } finally {
            setIsMerging(false);
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
                <Header />
                <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col">
                    <div className="flex-grow bg-gray-800 border-2 border-dashed border-gray-600 rounded-2xl p-4 md:p-8 flex flex-col shadow-2xl">
                        {files.length === 0 ? (
                            <div className="m-auto text-center">
                                <UploadCloudIcon className="mx-auto h-16 w-16 text-gray-500" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-300">Drag and drop files here</h3>
                                <p className="mt-1 text-sm text-gray-500">PDF, PNG, JPG supported</p>
                                <FileUpload onFilesAdded={handleFilesAdded} />
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <FileList files={files} onRemoveFile={handleRemoveFile} moveFile={moveFile} />
                                <FileUpload onFilesAdded={handleFilesAdded} isSecondary={true} />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">
                            <p>{error}</p>
                        </div>
                    )}

                    {files.length > 0 && (
                        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button
                                onClick={handleMerge}
                                disabled={isMerging}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                            >
                                {isMerging ? (
                                    <>
                                        <Spinner />
                                        Merging...
                                    </>
                                ) : (
                                    'Merge Files'
                                )}
                            </button>
                             <button
                                onClick={handleClearAll}
                                disabled={isMerging}
                                className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </main>
                <footer className="text-center p-4 text-gray-500 text-sm">
                    <p>PDF Fusion &copy; {new Date().getFullYear()}</p>
                </footer>
            </div>
        </DndProvider>
    );
};

export default App;