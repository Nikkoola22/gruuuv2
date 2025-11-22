module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json([
    { 
      title: 'Test RSS API',
      link: 'https://example.com',
      description: 'The RSS API is working!'
    }
  ]);
};
