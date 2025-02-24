from fastapi.responses import JSONResponse
from .utils import fetch_all_documents


def get_all_documents():
    try:
        documents = fetch_all_documents()
        if not documents:
            return JSONResponse(content={"message": "No documents found."}, status_code=404)

        return JSONResponse(content={"documents": documents}, status_code=200)
    except Exception as e:
        print(repr(e))
        return JSONResponse(content={"message": "Failed to fetch documents", "error": str(e)}, status_code=500)
