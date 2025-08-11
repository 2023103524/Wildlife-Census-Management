app.post('/api/species/process', async (req, res) => {
    try {
        const [results] = await db.query('CALL process_species_data()');
        res.json({ 
            message: 'Species data processed successfully',
            data: results[0] 
        });
    } catch (error) {
        console.error('Error processing species data:', error);
        res.status(500).json({ 
            error: 'Error processing species data',
            details: error.message 
        });
    }
});