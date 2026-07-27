'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { HeroBackgroundImageItem } from './HeroBackgroundImageItem';

interface HeroBackgroundImageGalleryProps {
    imageUrls: string[];
    isLoading: boolean;
    onReorder: (fromIndex: number, toIndex: number) => Promise<void>;
    onRemove: (index: number) => Promise<void>;
    onImageError: (index: number) => void;
    imageErrors: Record<number, boolean>;
}

export function HeroBackgroundImageGallery({
    imageUrls,
    isLoading,
    onReorder,
    onRemove,
    onImageError,
    imageErrors,
}: HeroBackgroundImageGalleryProps) {
    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const fromIndex = result.source.index;
        const toIndex = result.destination.index;

        if (fromIndex === toIndex) return;

        await onReorder(fromIndex, toIndex);
    };

    if (imageUrls.length === 0) return null;

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId='gallery' direction='horizontal'>
                {(provided) => (
                    <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
                    >
                        {imageUrls.map((url, index) => (
                            <Draggable
                                key={`${url}-${index}`}
                                draggableId={`${url}-${index}`}
                                index={index}
                                isDragDisabled={isLoading}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className='touch-none'
                                    >
                                        <HeroBackgroundImageItem
                                            url={url}
                                            index={index}
                                            isDragging={snapshot.isDragging}
                                            onRemove={onRemove}
                                            onError={onImageError}
                                            hasError={!!imageErrors[index]}
                                            isLoading={isLoading}
                                            dragHandleProps={provided.dragHandleProps}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}