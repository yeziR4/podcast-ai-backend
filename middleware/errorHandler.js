/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('\n❌ Error occurred:');
  console.error('   Path:', req.path);
  console.error('   Method:', req.method);
  console.error('   Error:', err.message);
  console.error('   Stack:', err.stack);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Internal server error',
      type: err.name || 'Error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  };

  // Send response
  res.status(statusCode).json(errorResponse);
}
