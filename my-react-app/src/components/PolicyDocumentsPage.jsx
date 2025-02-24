import React, { useState, useEffect } from "react";

const PolicyDocumentsPage = ({ isAdmin }) => {
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/document", {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = await res.json();
      setDocuments(data.documents);
    } catch (err) {
      console.error(err.message);
    }
  };

  const uploadDocument = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const file = e.target.files[0];

    if (file) {
      formData.append("file", file);

      try {
        const res = await fetch("http://127.0.0.1:8000/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload document");
        }

        await fetchDocuments(); // Refresh documents after upload
        alert("Document uploaded successfully!");
      } catch (err) {
        console.error(err.message);
        alert("Failed to upload document.");
      }
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="w-4/5 min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-3xl font-bold text-blue-500 mb-4">Policy Documents</h1>

      {/* Admin-only Upload Section */}
      {isAdmin && (
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">
            Upload New Document
          </label>
          <input
            type="file"
            onChange={uploadDocument}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      )}

      {/* Document List */}
      <div className="w-full bg-white border border-dashed border-gray-400 rounded-md p-4">
        {documents.length === 0 ? (
          <p className="text-gray-500">No documents uploaded yet.</p>
        ) : (
          <ul className="list-disc pl-4">
            {documents.map((doc) => (
              <li key={doc.id} className="mb-2">
                <a
                  href={doc.file_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {doc.file_name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PolicyDocumentsPage;
