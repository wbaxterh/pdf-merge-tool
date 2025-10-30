
import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import type { AppFile } from '../types';
import { ItemTypes } from '../types';
import { FileIcon, GripVerticalIcon, Trash2Icon } from '../constants';

interface FileItemProps {
    appFile: AppFile;
    index: number;
    onRemove: (id: string) => void;
    moveFile: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

const FileItem: React.FC<FileItemProps> = ({ appFile, index, onRemove, moveFile }) => {
    const ref = useRef<HTMLLIElement>(null);

    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
        accept: ItemTypes.FILE,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: DragItem, monitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;

            if (dragIndex === hoverIndex) return;
            
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;
            
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
            
            moveFile(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.FILE,
        item: () => ({ id: appFile.id, index }),
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const isImage = appFile.file.type.startsWith('image/');
    
    return (
        <li
            ref={ref}
            data-handler-id={handlerId}
            style={{ opacity: isDragging ? 0.4 : 1 }}
            className="flex items-center p-3 bg-gray-700/50 rounded-lg shadow-md transition-shadow duration-200 hover:bg-gray-700"
        >
            <div ref={preview} className="flex items-center flex-grow truncate">
                <div className="cursor-move text-gray-500 hover:text-gray-300 mr-3">
                  <GripVerticalIcon className="w-5 h-5"/>
                </div>
                <div className="flex-shrink-0 h-12 w-12 bg-gray-800 rounded-md flex items-center justify-center overflow-hidden">
                    {isImage ? (
                        <img src={appFile.previewUrl} alt={appFile.file.name} className="h-full w-full object-cover" />
                    ) : (
                        <FileIcon className="h-6 w-6 text-indigo-400" />
                    )}
                </div>
                <div className="ml-4 truncate">
                    <p className="text-sm font-medium text-gray-200 truncate" title={appFile.file.name}>
                        {appFile.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                        {formatFileSize(appFile.file.size)}
                    </p>
                </div>
            </div>
            <button
                onClick={() => onRemove(appFile.id)}
                className="ml-4 flex-shrink-0 p-2 rounded-full text-gray-500 hover:bg-red-900/50 hover:text-red-400 transition-colors duration-200"
                aria-label="Remove file"
            >
                <Trash2Icon className="h-5 w-5" />
            </button>
        </li>
    );
};

export default FileItem;
