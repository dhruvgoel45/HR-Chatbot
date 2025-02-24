import React, { useState } from "react";
import pdf from "../assets/images/pdf.jpg";

const PaginatedTable = ({ documents, disablePagination = false,onSelectDocuments }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const [selectedDocs, setSelectedDocs] = useState([]);


    const totalPages = Math.ceil(documents.length / itemsPerPage);

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    // Show all documents if pagination is disabled, else paginate
    const displayedDocuments = disablePagination ? documents : documents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
   const handleCheckboxChange = (doc) => {
    let updatedSelection = [...selectedDocs];

    // Check if the document is already selected
    const isSelected = updatedSelection.some(selected => selected.document_id === doc.id);

    if (isSelected) {
        // Remove document if already selected
        updatedSelection = updatedSelection.filter(selected => selected.document_id !== doc.id);
        console.log(`Removed document:`, doc);
    } else {
        // Add document with full details
        const newDoc = {
            document_id: doc.document_id,
            file_name: doc.file_name,
            category: doc.category,
            description: doc.description,
            effective_date: doc.effective_date
        };

        updatedSelection.push(newDoc);
        console.log(`Added document:`, newDoc);
    }

    setSelectedDocs(updatedSelection);
    onSelectDocuments(updatedSelection); // Pass updated docs

    // Log the full list of selected documents
    console.log("Updated selected documents list:", updatedSelection);
};

    return (
        <div className="pt-6 text-left font-rubik ">
            {documents.length === 0 ? (
                <p className="text-gray-500">No documents uploaded yet.</p>
            ) : (
                <table className="w-full table-auto border bg-white rounded-lg">
                    <thead>
                        <tr className="bg-white-100 border">
                            <th className="px-6 py-4 border-b"></th>
                            <th className="px-6 py-4 border-b">Title</th>
                            <th className="px-6 py-4 border-b">Category</th>
                            <th className="px-6 py-4 border-b">Description</th>
                            <th className="px-6 py-4 border-b">Effective Date</th>
                            <th className="px-6 py-4 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedDocuments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 border-t text-center">
                                <input
                                        type="checkbox"
                                        checked={selectedDocs.some(selected => selected.document_id === doc.document_id)}
                                        onChange={() => handleCheckboxChange(doc)}
                                    />                                </td>
                                <td className="px-6 py-4 border-t">
                                    <div className="flex items-center space-x-4">
                                        <img src={pdf} alt="PDF Icon" className="h-12 w-12" />
                                        <span>{doc.document_name || doc.file_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 border-t">{doc.category || "General"}</td>
                                <td className="px-6 py-4 border-t">{doc.description || "No description available"}</td>
                                <td className="px-6 py-4 border-t">{doc.effective_date || "2025-01-01"}</td>
                                <td className="px-6 py-4 border-t flex gap-4">
                                    <a
                                        href={doc.file_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                    >
                                        View PDF
                                    </a>
                                    <a
                                        href={doc.file_link}
                                        download
                                        className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-400"
                                    >
                                        Download PDF
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    {!disablePagination && documents.length > itemsPerPage && (
                        <tfoot>
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center">
                                    <div className="flex justify-center items-center gap-4">
                                        <button
                                            onClick={handlePrevious}
                                            disabled={currentPage === 1}
                                            className={`px-4 py-2 text-sm border rounded-lg ${
                                                currentPage === 1 ? "cursor-not-allowed bg-gray-200" : ""
                                            }`}
                                        >
                                            Previous
                                        </button>

                                        <div className="flex gap-2">
                                            {Array.from({ length: totalPages }, (_, index) => (
                                                <button
                                                    key={index + 1}
                                                    onClick={() => handlePageClick(index + 1)}
                                                    className={`px-4 py-2 text-sm border rounded-lg ${
                                                        currentPage === index + 1
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-white text-blue-500 border-blue-500 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleNext}
                                            disabled={currentPage === totalPages}
                                            className={`px-4 py-2 text-sm border rounded-lg ${
                                                currentPage === totalPages
                                                    ? "cursor-not-allowed bg-gray-200"
                                                    : ""
                                            }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            )}
            
        </div>
    );
};

export default PaginatedTable;
