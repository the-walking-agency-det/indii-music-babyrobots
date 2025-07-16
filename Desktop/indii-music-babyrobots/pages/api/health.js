export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      status: 'ok',
      message: 'Indii Music API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}