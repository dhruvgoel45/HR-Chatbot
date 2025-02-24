import React, { useState } from "react";
import { Spinner, Alert } from "@material-tailwind/react";

const UploadPolicyCard = ({ onClose, onDocumentUpload }) => {
    const [documentName, setDocumentName] = useState("");
    const [category, setCategory] = useState("");
    const [effectiveDate, setEffectiveDate] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState(null); // For success/error alerts

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleFileDrop = (event) => {
        event.preventDefault();
        setFile(event.dataTransfer.files[0]);
    };

    const uploadDocument = async (e) => {
        e.preventDefault();
        if (!file) {
            setAlert({ message: "Please select a file.", color: "red" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("document_name", documentName);
        formData.append("category", category);
        formData.append("effective_date", effectiveDate);
        formData.append("description", description);

        setIsLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:8000/knowledge", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Error response:", errorText);
                throw new Error("Failed to upload document");
            }

            const response = await res.json();
            const newDocument = {
                id: response.id,
                document_name: documentName,
                category,
                effective_date: effectiveDate,
                description,
                file_link: response.file_link,
            };

            // Pass the new document to the parent component
            if (onDocumentUpload) onDocumentUpload(newDocument); // Call the function immediately

            setAlert({ message: "Document uploaded successfully!", color: "green" });
            onClose();
        } catch (err) {
            console.error(err.message);
            setAlert({ message: "Failed to upload document.", color: "red" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-12 w-[90%] max-w-2xl relative m-12">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
            >
                X
            </button>
            <h2 className="text-2xl font-medium mb-6 text-gray-700">Upload New Policy</h2>
            {alert && (
                <Alert color={alert.color} className="mb-4">
                    {alert.message}
                </Alert>
            )}
            <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center mb-6"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
            >
                <p className="text-gray-600 mb-4 text-center">
                    Click or drag file to this area to upload
                </p>
                <input type="file" onChange={handleFileChange} hidden id="file-upload" />
                <label
                    htmlFor="file-upload"
                    className="bg-blue-500 text-white px-12 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
                >
                    Browse files from computer
                </label>
                {file && <p className="text-green-600 mt-2">{file.name} selected</p>}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-gray-700 font-bold mb-1">Document Name</label>
                    <input
                        type="text"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                        placeholder="Enter document name"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-bold mb-1">Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                    >
                        <option value="">Select category</option>
                        <option value="HR">HR</option>
                        <option value="Legal">Legal</option>
                        <option value="Finance">Finance</option>
                    </select>
                </div>
                <div>
                    <label className="block text-gray-700 font-bold mb-1">Effective Date</label>
                    <input
                        type="date"
                        value={effectiveDate}
                        onChange={(e) => setEffectiveDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 font-bold mb-1">Description</label>
                <textarea
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300"
                    placeholder="Enter a description for the document"
                ></textarea>
            </div>
            <div className="flex justify-center">
    <button
        onClick={uploadDocument}
        className="bg-blue-500 text-white px-24 py-2 rounded-lg align-middle hover:bg-blue-600 flex items-center gap-2"
        disabled={isLoading}
    >
        {isLoading ? <Spinner className="h-6 w-6" /> : "Upload Document"}
    </button>
</div>
        </div>
    );
};

export default UploadPolicyCard;
