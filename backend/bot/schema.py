from pydantic import BaseModel

class Parms(BaseModel):
    query_text : str
    username : str
    email_id : str
    
        
