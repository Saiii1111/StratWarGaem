// netlify/functions/verify-token.js
const jwt = require('jsonwebtoken');

exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      }
    };
  }
  
  try {
    const authHeader = event.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers: { 
          'Access-Control-Allow-Origin': '*', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          valid: false, 
          error: 'No token provided' 
        })
      };
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
      
      return {
        statusCode: 200,
        headers: { 
          'Access-Control-Allow-Origin': '*', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          valid: true,
          user: {
            id: decoded.userId,
            username: decoded.username
          }
        })
      };
    } catch (error) {
      return {
        statusCode: 401,
        headers: { 
          'Access-Control-Allow-Origin': '*', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          valid: false, 
          error: 'Invalid token' 
        })
      };
    }
    
  } catch (error) {
    console.error('Verify token error:', error);
    return {
      statusCode: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        valid: false, 
        error: 'Internal server error' 
      })
    };
  }
};
