'use client'

import { Trip } from "@/lib/types";
import TripExperiencesCard from "@/app/(ui)/trips/trip-experiences-card";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState } from "react";

interface TripExperiencesListProps {
    trip: Trip;
    session_user_id: string;
    isEditMode: boolean;
    onEditAction?: (
        action: 'edit' | 'save' | 'cancel',
        payload: {
            orderedExperiences: Trip['experiences'];
            unorderedExperiences: Trip['experiences'];
        }
    ) => void;
}

export default function DraggableExperiences({
                                                 trip,
                                                 session_user_id,
                                                 isEditMode,
                                                 onEditAction,
                                             }: TripExperiencesListProps) {
    // States to manage experience orders
    const [orderedExperiences, setOrderedExperiences] = useState(
        trip.experiences.filter(exp => exp.order > 0).sort((a, b) => a.order - b.order)
    );
    const [unorderedExperiences, setUnorderedExperiences] = useState(
        trip.experiences.filter(exp => exp.order === 0)
    );

    function handleDragEnd(result: DropResult) {
        const { source, destination } = result;
        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        let newOrdered = orderedExperiences;
        let newUnordered = unorderedExperiences;

        const sourceList =
            source.droppableId === "ordered" ? orderedExperiences : unorderedExperiences;
        const destList =
            destination.droppableId === "ordered" ? orderedExperiences : unorderedExperiences;

        // Moving within the same list
        if (source.droppableId === destination.droppableId) {
            const newList = Array.from(sourceList);
            const [removed] = newList.splice(source.index, 1);
            newList.splice(destination.index, 0, removed);

            if (source.droppableId === "ordered") {
                newOrdered = newList.map((exp, i) => ({ ...exp, order: i + 1 }));
                setOrderedExperiences(newOrdered);
            } else {
                newUnordered = newList;
                setUnorderedExperiences(newUnordered);
            }
        } else {
            // Moving between lists
            const sourceClone = Array.from(sourceList);
            const destClone = Array.from(destList);
            const [removed] = sourceClone.splice(source.index, 1);

            if (destination.droppableId === "ordered") {
                removed.order = destination.index + 1;
            } else {
                removed.order = 0;
            }

            destClone.splice(destination.index, 0, removed);

            if (source.droppableId === "ordered") {
                newOrdered = sourceClone.map((exp, i) => ({ ...exp, order: i + 1 }));
                newUnordered = destClone;
                setOrderedExperiences(newOrdered);
                setUnorderedExperiences(newUnordered);
            } else {
                newUnordered = sourceClone;
                newOrdered = destClone.map((exp, i) => ({ ...exp, order: i + 1 }));
                setUnorderedExperiences(newUnordered);
                setOrderedExperiences(newOrdered);
            }
        }

        // Update on about latest order
        onEditAction?.('edit', {
            orderedExperiences: newOrdered,
            unorderedExperiences: newUnordered,
        });
    }


    if (!trip.experiences || trip.experiences.length === 0) {
        return <p className="text-gray-500">No experiences linked to this trip.</p>;
    }

    return (
        <div className="space-y-6">
            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* LEFT: Ordered */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Ordered Experiences {!isEditMode && `(${orderedExperiences.length})`}
                            </h3>
                        </div>

                        <Droppable droppableId="ordered">
                            {(provided, snapshot) => (
                                <div
                                    className={`space-y-3 min-h-[300px] p-4 rounded-lg transition-colors ${
                                        isEditMode
                                            ? snapshot.isDraggingOver
                                                ? "bg-blue-100 border-2 border-blue-300"
                                                : "bg-gray-50 border-2 border-dashed border-gray-300"
                                            : "bg-gray-50"
                                    }`}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {orderedExperiences.length === 0 ? (
                                        <div className="flex items-center justify-center h-64 text-gray-400">
                                            {isEditMode
                                                ? "Drop experiences here to order them"
                                                : "No ordered experiences yet"}
                                        </div>
                                    ) : (
                                        orderedExperiences.map((exp, index) => (
                                            <Draggable
                                                key={exp.experience_id}
                                                draggableId={`ordered-${exp.experience_id}`}
                                                index={index}
                                                isDragDisabled={!isEditMode}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`transition-all ${
                                                            snapshot.isDragging
                                                                ? "opacity-70 scale-105 shadow-lg rotate-2"
                                                                : isEditMode
                                                                    ? "hover:shadow-md"
                                                                    : ""
                                                        }`}
                                                    >
                                                        <TripExperiencesCard
                                                            experience={exp}
                                                            session_user_id={session_user_id}
                                                            trip_id={trip.trip_id}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    {/* RIGHT: Unordered */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Unordered Experiences {!isEditMode && `(${unorderedExperiences.length})`}
                        </h3>

                        <Droppable droppableId="unordered">
                            {(provided, snapshot) => (
                                <div
                                    className={`space-y-3 min-h-[300px] p-4 rounded-lg transition-colors ${
                                        isEditMode
                                            ? snapshot.isDraggingOver
                                                ? "bg-gray-100 border-2 border-gray-50"
                                                : "bg-gray-50 border-2 border-dashed border-gray-300"
                                            : "bg-gray-50"
                                    }`}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    {unorderedExperiences.length === 0 ? (
                                        <div className="flex items-center justify-center h-64 text-gray-400">
                                            {isEditMode
                                                ? "Drop experiences here to remove ordering"
                                                : "No unordered experiences"}
                                        </div>
                                    ) : (
                                        unorderedExperiences.map((exp, index) => (
                                            <Draggable
                                                key={exp.experience_id}
                                                draggableId={`unordered-${exp.experience_id}`}
                                                index={index}
                                                isDragDisabled={!isEditMode}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`transition-all ${
                                                            snapshot.isDragging
                                                                ? "opacity-70 scale-105 shadow-lg rotate-2"
                                                                : isEditMode
                                                                    ? "hover:shadow-md"
                                                                    : ""
                                                        }`}
                                                    >
                                                        <TripExperiencesCard
                                                            experience={exp}
                                                            session_user_id={session_user_id}
                                                            trip_id={trip.trip_id}
                                                        />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
}
