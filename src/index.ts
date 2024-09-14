import colors from 'colors'
import server from './server'


const port = process.env.PORT || 3000

server.listen(port, () => {
    console.log( colors.yellow.bold(`REST API Server is running on port:  ${port}` ))
})