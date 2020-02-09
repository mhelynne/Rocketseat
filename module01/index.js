const express = require('express');
const { Router } = require('express');

const server = express();
const routes = new Router();

server.use(express.json());

const fruits = [{id: 1, name: "Banana", props: []}, {id: 2, name: "Apple", props: []}, {id: 3, name: "Grape", props: []}];
let count = 0;

// Log middleware 
server.use((req, res, next) => {
    count ++;
    console.log(`Request #${count}: HTTP ${req.method} ${req.path}`);
    return next();
});

// Middleware to check if fruit id exists
// It adds a req.index if it does
function checkIfFruitIdExists(req, res, next) {
    const { id } = req.params;

    const index = fruits.findIndex( f => f.id == id );
    
    // Fruit not found
    if (index<0) { 
        return res.status(400).json({ error: "Fruit does not exist"});       
    }
    
    // Fruit found
    req.index = index;
    return next();
};

function checkNameOnReqBody(req, res, next) {
    const { name } = req.body;
    if(!name) {
        return res.status(400).json({ error: "Fruit name is missing on request body"});      
    }

    return next();
};

routes.get('/', (req, res) => {
    return res.json({ message: "Welcome home, we have fruits!" });
});

routes.get('/fruits', (req, res) => {
    return res.json(fruits);
});

routes.get('/fruits/:id', checkIfFruitIdExists, (req, res) => {
    const { index } = req;

    return res.json(fruits[index]);
});

routes.post('/fruits', checkNameOnReqBody, (req, res) => {
    const newFruit = req.body;
    const { id } = newFruit;

    if(!id) {
        return res.status(400).json({ error: "Fruit id is missing on request body"}); 
    }
    const found = fruits.find( f => f.id == id);
    if (found) {
        return res.status(400).json({ error: "Fruit id already exists"});
    } 
    
    newFruit.props = [];
    fruits.push(newFruit);
    return res.json(newFruit);
});

routes.post('/fruits/:id/props', checkIfFruitIdExists, (req, res) => {
    const newProp = req.body;
    const { id: propId, prop } = newProp;
    const fruit = fruits[req.index];
    const fruitProps = fruit.props;

    if(!prop) {
        return res.status(400).json({ error: "Propertie is missing on request body"}); 
    }

    if(!propId) {
        return res.status(400).json({ error: "Propertie id is missing on request body"}); 
    }
    const found = fruitProps.find( p => p.id == propId);
    if (found) {
        return res.status(400).json({ error: "Propertie id already exists"});
    }

    fruitProps.push(newProp);
    return res.json(fruit);

    

});

routes.put('/fruits/:id', checkIfFruitIdExists, checkNameOnReqBody, (req, res) => {
    const { name } = req.body;
    const { index } = req;
    
    fruits[index].name = name;
    return res.json(fruits[index]);
});

routes.delete('/fruits/:id', checkIfFruitIdExists, (req, res) => {
    const { index } = req;

    fruits.splice(index, 1);
    return res.json({ message: "Fruit deleted" });
});


server.use(routes);
server.listen(3000);
