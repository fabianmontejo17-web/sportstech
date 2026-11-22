const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Importar rutas
const authRoutes = require('./src/routes/auth.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const partidosRoutes = require('./src/routes/partidos.routes'); 
const equiposRoutes = require('./src/routes/equipos.routes');   
const calendarioRoutes = require('./src/routes/calendario.routes'); 
const torneosRoutes = require('./src/routes/torneos.routes'); // NUEVA RUTA
const publicoRoutes = require('./src/routes/publico.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/torneos', torneosRoutes); // RUTA DE TORNEOS
app.use('/api', calendarioRoutes);       
app.use('/api/partidos', partidosRoutes); 
app.use('/api/equipos', equiposRoutes);  
app.use('/api/publico', publicoRoutes);  

app.get('/', (req, res) => {
  res.send('API de SportsTech funcionando 🚀');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});