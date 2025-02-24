from fastapi.responses import JSONResponse

def success_response(msg: str, data: dict = None):
    """
    Generate a success response.
    """
    return JSONResponse(
        status_code=200,
        content={"status": "success", "message": msg, "data": data},
    )

def error_response(msg: str):
    """
    Generate an error response.
    """
    return JSONResponse(
        status_code=400,
        content={"status": "error", "message": msg},
    )
