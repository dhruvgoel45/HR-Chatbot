

1. navigate to backend directory,Create a virtual environment and activate it:

```
python -m venv env
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

2. Install the required dependencies:

```
pip install -r requirements.txt
```

3. Set up the environment variables:

Create a `.env` file in the project root directory and add the following variables:

```
OPENAI_API_KEY = 
LLAMA_CLOUD_API_KEY = 
MONGO_URI = 
DATABASE_NAME = 
```

Replace the placeholders with your actual API keys and MongoDB connection details.

## Running the Application

1. Start the FastAPI server:

```
uvicorn main:application --reload
```

The server will start running at `http://localhost:8000`.



1. navigate to backend directory,Create a virtual environment and activate it:

```
python -m venv env
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

2. Install the required dependencies:

```
pip install -r requirements.txt
```

3. Set up the environment variables:

Create a `.env` file in the project root directory and add the following variables:

```
OPENAI_API_KEY = 
LLAMA_CLOUD_API_KEY = 
MONGO_URI = 
DATABASE_NAME = 
```

Replace the placeholders with your actual API keys and MongoDB connection details.

## Running the Application

1. Start the FastAPI server:

```
uvicorn main:application --reload
```

The server will start running at `http://localhost:8000`.

to run the frontend:
1. Clone the Repository

git clone <repository-url>
cd <repository-folder>

2. Install Dependencies

Use npm or yarn to install the required packages:

npm install
# or
yarn install

3. Start the Development Server

Run the following command to start the development server:

npm start
# or
yarn start

The application will be accessible at http://localhost:5173 in your web browser.





 /user
Purpose: to create a new user 
url:http://localhost:5173/user
Methods: POST 
Input Data:
For user registration or profile updates:
json
Copy code
{
  
    "username": "username",
    "email": "emailid",
    "full_name": "name",
    "password": "password",
    "is_admin":false // set to true if you want to give admin privileges
}

