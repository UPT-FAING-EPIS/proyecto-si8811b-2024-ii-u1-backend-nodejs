import app from './app.js';
import dotenv from 'dotenv';


dotenv.config();

const port = process.env.PORT || 5050

app.listen(port, () => {
    console.log(`REST API Server is running on port:  ${port}`);
});