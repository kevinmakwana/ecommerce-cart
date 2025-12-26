import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function DataTable({
    data = [],
    columns = [],
    searchable = false,
    sortable = true,
    perPageOptions = [10, 25, 50, 100],
}) {
    const [search, setSearch] = useState('');
    const [perPage, setPerPage] = useState(perPageOptions[0]);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter data based on search
    const filteredData = data.filter((item) => {
        if (!search) return true;
        return columns.some((column) => {
            const value = item[column.key];
            return value && value.toString().toLowerCase().includes(search.toLowerCase());
        });
    });

    // Sort data
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortColumn) return 0;
        
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue === bValue) return 0;
        
        // Handle numeric comparisons
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            // Both are numbers, compare numerically
            const comparison = aNum - bNum;
            return sortDirection === 'asc' ? comparison : -comparison;
        }
        
        // String comparison
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        const comparison = aStr > bStr ? 1 : -1;
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    // Paginate data
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sortedData.length / perPage);

    const handleSort = (columnKey) => {
        if (!sortable) return;
        
        if (sortColumn === columnKey) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handlePerPageChange = (e) => {
        setPerPage(Number(e.target.value));
        setCurrentPage(1); // Reset to first page
    };

    const renderCell = (item, column) => {
        const value = item[column.key];
        
        if (column.render) {
            return column.render(item, value);
        }
        
        if (column.type === 'badge') {
            return (
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${column.badgeClass(value)}`}>
                    {value}
                </span>
            );
        }
        
        if (column.type === 'currency') {
            return `$${parseFloat(value).toFixed(2)}`;
        }
        
        if (column.type === 'date') {
            return new Date(value).toLocaleDateString();
        }
        
        return value;
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        
        return pages;
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-sm">
            {/* Search and Per Page Controls */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    {searchable && (
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                        <label htmlFor="perPage" className="text-sm text-gray-600">
                            Show
                        </label>
                        <select
                            id="perPage"
                            value={perPage}
                            onChange={handlePerPageChange}
                            className="border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {perPageOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-600">entries</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                                        column.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {column.sortable !== false && sortable && sortColumn === column.key && (
                                            <span className="text-indigo-600">
                                                {sortDirection === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <tr key={item.id || index} className="hover:bg-gray-50 transition-colors">
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {renderCell(item, column)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-10 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <svg
                                            className="h-12 w-12 text-gray-400 mb-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                            />
                                        </svg>
                                        <p className="text-sm font-medium">No data found</p>
                                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search criteria</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-600">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span> of{' '}
                    <span className="font-medium">{sortedData.length}</span> results
                </p>

                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>

                        {renderPagination().map((page, index) => (
                            <button
                                key={index}
                                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                disabled={page === '...'}
                                className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    page === currentPage
                                        ? 'bg-indigo-600 text-white'
                                        : page === '...'
                                        ? 'text-gray-400 cursor-default'
                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
