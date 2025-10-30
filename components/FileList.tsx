
import React from 'react';
import type { AppFile } from '../types';
import FileItem from './FileItem';

interface FileListProps {
    files: AppFile[];
    onRemoveFile: (id: string) => void;
    moveFile: (dragIndex: number, hoverIndex: number) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemoveFile, moveFile }) => {
    return (
        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
            <ul className="space-y-3">
                {files.map((appFile, index) => (
                    <FileItem
                        key={appFile.id}
                        index={index}
                        appFile={appFile}
                        onRemove={onRemoveFile}
                        moveFile={moveFile}
                    />
                ))}
            </ul>
        </div>
    );
};

export default FileList;
