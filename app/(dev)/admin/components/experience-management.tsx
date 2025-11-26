'use client'

import { useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    ColumnResizeMode,
} from '@tanstack/react-table';
import { Experience } from "@/lib/types";

type ExperienceManagementProps = {
    experiences: Experience[]
}

export default function ExperienceManagement({ experiences }: ExperienceManagementProps) {
    const [data, setData] = useState(experiences);
    const [globalFilter, setGlobalFilter] = useState("");
    const [columnResizeMode] = useState<ColumnResizeMode>('onChange');

    // Define columns for TanStack Table
    const columns: ColumnDef<Experience>[] = [
        {
            accessorKey: 'experience_id',
            header: 'ID',
            size: 30,
            enableResizing: false,
            cell: ({ getValue }) => (
                <span className="text-xs text-gray-600 font-mono">
                    {getValue() as number}
                </span>
            ),
        },
        {
            accessorKey: 'user_id',
            header: 'User ID',
            size: 100,
            minSize: 80,
            maxSize: 200,
            enableResizing: true,
            cell: ({ getValue }) => (
                <span className="text-xs text-gray-600 font-mono truncate block">
                    {getValue() as string}
                </span>
            ),
        },
        {
            accessorKey: 'title',
            header: 'Experience',
            size: 350,
            minSize: 250,
            enableResizing: true,
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium text-sm text-gray-900 truncate">
                        {row.original.title}
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                        {row.original.description}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'address',
            header: 'Location',
            size: 200,
            minSize: 150,
            enableResizing: true,
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="text-xs text-gray-900 truncate">
                        {row.original.address}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        {row.original.latitude.toFixed(4)}, {row.original.longitude.toFixed(4)}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'average_rating',
            header: 'Rating',
            size: 90,
            enableResizing: false,
            cell: ({ row }) => (
                <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-mono text-gray-900">
                            {row.original.owner_rating || '-'}/5
                        </span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Avg:</span>
                        <span className="font-mono text-gray-900">{row.original.average_rating}/5</span>
                    </div>
                    <div className="flex justify-between gap-2">
                        <span className="text-gray-600">Count:</span>
                        <span className="font-mono text-gray-900">{row.original.rating_count}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'experience_date',
            header: 'Date',
            size: 100,
            enableResizing: false,
            cell: ({ row }) => {
                const experienceDate = new Date(row.original.experience_date);
                const createDate = new Date(row.original.create_date);

                return (
                    <div className="space-y-1 text-xs font-mono">
                        <div className="text-gray-900 truncate">
                             {experienceDate.toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">
                            <div className="truncate">
                                {createDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </div>
                            <div className="truncate">
                                {createDate.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'keywords',
            header: 'Keywords',
            size: 200,
            enableResizing: false,
            cell: ({ getValue }) => {
                const raw = getValue() as string[] | null | undefined;
                const keywords = Array.isArray(raw) ? raw : [];  // handle null/undefined

                if (!keywords.length) {
                    return (
                        <span className="text-xs text-gray-400 italic">
                    No keywords
                </span>
                    );
                }

                return (
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {keywords.map((keyword, idx) => (
                            <span
                                key={idx}
                                className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded whitespace-nowrap"
                            >
                        {keyword}
                    </span>
                        ))}
                    </div>
                );
            },
        },
    ];

    // Initialize table
    const table = useReactTable({
        data,
        columns,
        columnResizeMode,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, columnId, filterValue) => {
            const searchValue = filterValue.toLowerCase();
            const exp = row.original;

            const keywords = Array.isArray(exp.keywords) ? exp.keywords : []; // null-safe

            return (
                exp.title.toLowerCase().includes(searchValue) ||
                exp.description.toLowerCase().includes(searchValue) ||
                exp.address.toLowerCase().includes(searchValue) ||
                keywords.some(k => k.toLowerCase().includes(searchValue)) ||
                exp.experience_id.toString().includes(searchValue) ||
                exp.user_id.toLowerCase().includes(searchValue)
            );
        },
    });

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="p-2">
                <input
                    type="text"
                    placeholder="Search experiences by title, description, address, or keywords..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Experiences Table */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                        <thead className="bg-gray-50 border-b">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative border-r border-gray-300 last:border-r-0"
                                        style={{
                                            width: header.getSize(),
                                            minWidth: header.column.columnDef.minSize,
                                            maxWidth: header.column.columnDef.maxSize,
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </div>
                                        {/* Resize Handle - Only show if resizing is enabled */}
                                        {header.column.getCanResize() && (
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                className={`absolute top-0 right-0 h-full w-2 cursor-col-resize select-none touch-none 
                                                          bg-gray-300 hover:bg-blue-500 transition-colors
                                                          ${header.column.getIsResizing() ? 'bg-blue-600' : ''}`}
                                                style={{
                                                    opacity: header.column.getIsResizing() ? 1 : 0.6,
                                                }}
                                            />
                                        )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                    No experiences found matching your search.
                                </td>
                            </tr>
                        ) : (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="px-3 py-3 border-r border-gray-200 last:border-r-0"
                                            style={{
                                                width: cell.column.getSize(),
                                                minWidth: cell.column.columnDef.minSize,
                                                maxWidth: cell.column.columnDef.maxSize,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
