// const { app } = require('@azure/functions');
// const connectDB = require('../utils/db');
// const {
//   createExpense,
//   getAllExpenses,
//   getExpenseById,
//   updateExpense,
//   deleteExpense,
//   getExpenseStats,
//   getExpensesByLorry,
//   getExpensesByBunk,
//   getFuelExpensesSummary
// } = require('../controllers/expense.controller');
// const { verifyToken } = require('../middleware/auth.middleware');
// const Busboy = require('busboy');

// /**
//  * ✅ Create Expense
//  */

// /**
//  * ✅ Create Expense WITH FILE UPLOAD
//  */
// app.http('createExpense', {
//   methods: ['POST'],
//   authLevel: 'anonymous',
//   route: 'expenses/create',
//   handler: async (req, context) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(req);

//       // Only owners can create expenses
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const headers = Object.fromEntries(req.headers);
//       const busboy = Busboy({ headers });

//       let expenseData = {};
//       let proofFile = null;

//       const fileParsePromise = new Promise((resolve, reject) => {
//         busboy.on('field', (fieldname, val) => {
//           // Parse JSON fields
//           if (fieldname === 'data' || fieldname === 'expenseData') {
//             try {
//               expenseData = JSON.parse(val);
//             } catch (e) {
//               expenseData = {};
//             }
//           } else if (fieldname === 'owner_id' || fieldname === 'lorry_id' || 
//                      fieldname === 'bunk_id' || fieldname === 'category' ||
//                      fieldname === 'amount' || fieldname === 'description' ||
//                      fieldname === 'payment_mode' || fieldname === 'date') {
//             // Direct fields
//             expenseData[fieldname] = val;
//           }
//         });

//         busboy.on('file', (fieldname, file, { filename, encoding, mimeType }) => {
//           const chunks = [];

//           file.on('data', (chunk) => chunks.push(chunk));
          
//           file.on('end', () => {
//             if (fieldname === 'proof') {
//               proofFile = {
//                 fieldname,
//                 originalname: filename,
//                 mimetype: mimeType,
//                 buffer: Buffer.concat(chunks),
//                 size: chunks.reduce((acc, chunk) => acc + chunk.length, 0)
//               };
//             }
//           });
//         });

//         busboy.on('finish', resolve);
//         busboy.on('error', reject);
//       });

//       // Feed Busboy with raw buffer
//       const buffer = Buffer.from(await req.arrayBuffer());
//       busboy.end(buffer);
//       await fileParsePromise;

//       // Set owner from token
//       expenseData.owner_id = user.userId;

//       // Validate required fields
//       if (!expenseData.owner_id || !expenseData.lorry_id || 
//           !expenseData.category || !expenseData.amount || 
//           !expenseData.payment_mode) {
//         return {
//           status: 400,
//           jsonBody: { 
//             success: false, 
//             error: 'Owner ID, lorry ID, category, amount, and payment mode are required' 
//           },
//         };
//       }

//       // Validate bunk_id for fuel expenses
//       if (expenseData.category === 'fuel' && !expenseData.bunk_id) {
//         return {
//           status: 400,
//           jsonBody: { 
//             success: false, 
//             error: 'Bunk ID is required for fuel expenses' 
//           },
//         };
//       }

//       // Call controller with expense data and proof file
//       const result = await createExpense(expenseData, proofFile);
      
//       const response = { status: 201, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       context.log('Create expense error:', err.message);
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get All Expenses for Owner
//  */
// app.http('getAllExpenses', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'expenses',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their expenses
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const filterParams = request.query;
//       const result = await getAllExpenses(user.userId, filterParams);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get Expense by ID
//  */
// app.http('getExpenseById', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'expenses/{expenseId}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their expenses
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { expenseId } = request.params;
//       const { include_inactive } = request.query;
      
//       const result = await getExpenseById(
//         expenseId, 
//         user.userId,
//         include_inactive === 'true'
//       );

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Update Expense
//  */
// /**
//  * ✅ Update Expense WITH FILE UPLOAD
//  */
// app.http('updateExpense', {
//   methods: ['PUT'],
//   authLevel: 'anonymous',
//   route: 'expenses/update/{expenseId}',
//   handler: async (req, context) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(req);

//       // Only owners can update their expenses
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { expenseId } = req.params;
//       const headers = Object.fromEntries(req.headers);
//       const busboy = Busboy({ headers });

//       let updateData = {};
//       let proofFile = null;
//       let deleteProof = false;

//       const fileParsePromise = new Promise((resolve, reject) => {
//         busboy.on('field', (fieldname, val) => {
//           // Parse JSON fields
//           if (fieldname === 'data' || fieldname === 'updateData') {
//             try {
//               updateData = JSON.parse(val);
//             } catch (e) {
//               updateData = {};
//             }
//           } else if (fieldname === 'delete_proof') {
//             deleteProof = val === 'true';
//           } else if (fieldname === 'category' || fieldname === 'bunk_id' ||
//                      fieldname === 'amount' || fieldname === 'description' ||
//                      fieldname === 'payment_mode' || fieldname === 'date') {
//             // Direct fields
//             updateData[fieldname] = val;
//           }
//         });

//         busboy.on('file', (fieldname, file, { filename, encoding, mimeType }) => {
//           const chunks = [];

//           file.on('data', (chunk) => chunks.push(chunk));
          
//           file.on('end', () => {
//             if (fieldname === 'proof') {
//               proofFile = {
//                 fieldname,
//                 originalname: filename,
//                 mimetype: mimeType,
//                 buffer: Buffer.concat(chunks),
//                 size: chunks.reduce((acc, chunk) => acc + chunk.length, 0)
//               };
//             }
//           });
//         });

//         busboy.on('finish', resolve);
//         busboy.on('error', reject);
//       });

//       // Feed Busboy with raw buffer
//       const buffer = Buffer.from(await req.arrayBuffer());
//       busboy.end(buffer);
//       await fileParsePromise;

//       // Validate bunk_id if category is being changed to fuel
//       if (updateData.category === 'fuel' && !updateData.bunk_id) {
//         return {
//           status: 400,
//           jsonBody: { 
//             success: false, 
//             error: 'Bunk ID is required for fuel expenses' 
//           },
//         };
//       }

//       // Call controller with all parameters
//       const result = await updateExpense(
//         expenseId, 
//         user.userId, 
//         updateData, 
//         proofFile,
//         deleteProof
//       );

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       context.log('Update expense error:', err.message);
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Delete Expense
//  */
// app.http('deleteExpense', {
//   methods: ['DELETE'],
//   authLevel: 'anonymous',
//   route: 'expenses/delete/{expenseId}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can delete their expenses
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { expenseId } = request.params;
//       const result = await deleteExpense(expenseId, user.userId);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get Expense Statistics
//  */
// app.http('getExpenseStats', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'expenses/stats/{period}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view stats
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { period } = request.params;
//       const result = await getExpenseStats(user.userId, period);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get Expenses by Lorry
//  */
// app.http('getExpensesByLorry', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'expenses/lorry/{lorryId}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their expenses
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { lorryId } = request.params;
//       const filterParams = request.query;
      
//       const result = await getExpensesByLorry(user.userId, lorryId, filterParams);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

// /**
//  * ✅ Get Expenses by Bunk
//  */

// app.http('getExpensesByBunk', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   route: 'expenses/bunk/{bunkId}',
//   handler: async (request) => {
//     try {
//       await connectDB();
      
//       const { decoded: user, newAccessToken } = await verifyToken(request);

//       // Only owners can view their expenses
//       if (user.role !== 'owner') {
//         return {
//           status: 403,
//           jsonBody: { success: false, error: 'Access denied. Owner role required.' },
//         };
//       }

//       const { bunkId } = request.params;
//       const filterParams = request.query;
      
//       const result = await getExpensesByBunk(user.userId, bunkId, filterParams);

//       const response = { status: 200, jsonBody: { success: true, data: result } };
//       if (newAccessToken) {
//         response.jsonBody.newAccessToken = newAccessToken;
//       }
      
//       return response;
//     } catch (err) {
//       return {
//         status: err.status || 500,
//         jsonBody: { success: false, error: err.message },
//       };
//     }
//   },
// });

const { app } = require('@azure/functions');
const connectDB = require('../utils/db');
const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getExpensesByLorry,
  getExpensesByBunk,
  getFuelExpensesSummary
} = require('../controllers/expense.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const Busboy = require('busboy');

/**
 * ✅ Create Expense WITH FILE UPLOAD
 */
app.http('createExpense', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'expenses/create',
  handler: async (req, context) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(req);

      // Only owners can create expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const headers = Object.fromEntries(req.headers);
      const busboy = Busboy({ headers });

      let expenseData = {};
      let proofFile = null;
      let busboyError = null;

      const fileParsePromise = new Promise((resolve, reject) => {
        busboy.on('field', (fieldname, val) => {
          try {
            // Handle different field formats
            if (fieldname === 'data' || fieldname === 'expenseData') {
              try {
                expenseData = { ...expenseData, ...JSON.parse(val) };
              } catch (e) {
                // If parsing fails, use as string
                expenseData[fieldname] = val;
              }
            } else if (fieldname === 'amount' && val) {
              expenseData[fieldname] = parseFloat(val);
            } else if (fieldname === 'date' && val) {
              // Handle date - could be ISO string or timestamp
              expenseData[fieldname] = new Date(val);
            } else {
              // Direct fields
              expenseData[fieldname] = val;
            }
          } catch (error) {
            context.log(`Error parsing field ${fieldname}:`, error);
          }
        });

        busboy.on('file', (fieldname, file, { filename, encoding, mimeType }) => {
          const chunks = [];
          let fileSize = 0;
          const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

          // Validate file type
          const allowedMimeTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 
            'image/gif', 'image/webp', 'image/heic',
            'application/pdf'
          ];
          
          if (!allowedMimeTypes.includes(mimeType)) {
            file.destroy();
            busboyError = 'Only images (JPEG, PNG, GIF, WebP, HEIC) and PDF files are allowed';
            reject(new Error(busboyError));
            return;
          }

          file.on('data', (chunk) => {
            fileSize += chunk.length;
            if (fileSize > MAX_FILE_SIZE) {
              file.destroy();
              busboyError = 'File size exceeds 10MB limit';
              reject(new Error(busboyError));
              return;
            }
            chunks.push(chunk);
          });
          
          file.on('end', () => {
            if (fieldname === 'proof') {
              proofFile = {
                fieldname,
                originalname: filename,
                mimetype: mimeType,
                buffer: Buffer.concat(chunks),
                size: fileSize
              };
            }
          });

          file.on('error', (err) => {
            busboyError = err.message;
            reject(err);
          });
        });

        busboy.on('finish', () => {
          if (busboyError) {
            reject(new Error(busboyError));
          } else {
            resolve();
          }
        });

        busboy.on('error', (err) => {
          busboyError = err.message;
          reject(err);
        });
      });

      // Feed Busboy with raw buffer
      const buffer = Buffer.from(await req.arrayBuffer());
      busboy.end(buffer);
      
      try {
        await fileParsePromise;
      } catch (parseError) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: parseError.message || 'Error parsing form data' 
          },
        };
      }

      // Set owner from token
      expenseData.owner_id = user.userId;

      // Validate required fields
      if (!expenseData.owner_id || !expenseData.lorry_id || 
          !expenseData.category || !expenseData.amount || 
          !expenseData.payment_mode) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Owner ID, lorry ID, category, amount, and payment mode are required' 
          },
        };
      }

      // Convert amount to number if it's a string
      if (typeof expenseData.amount === 'string') {
        expenseData.amount = parseFloat(expenseData.amount);
      }

      // Validate amount is valid number
      if (isNaN(expenseData.amount) || expenseData.amount <= 0) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Amount must be a positive number' 
          },
        };
      }

      // Validate bunk_id for fuel expenses
      if (expenseData.category === 'fuel' && !expenseData.bunk_id) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Bunk ID is required for fuel expenses' 
          },
        };
      }

      // Clear bunk_id if category is not fuel
      if (expenseData.category !== 'fuel') {
        expenseData.bunk_id = null;
      }

      // Call controller with expense data and proof file
      const result = await createExpense(expenseData, proofFile);
      
      const response = { 
        status: 201, 
        jsonBody: { 
          success: true, 
          data: result,
          message: 'Expense created successfully'
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      context.log('Create expense error:', err.message);
      return {
        status: err.status || 500,
        jsonBody: { 
          success: false, 
          error: err.message,
          details: err.details || null
        },
      };
    }
  },
});

/**
 * ✅ Get All Expenses for Owner
 */
app.http('getAllExpenses', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = request.query;
      
      // Convert string booleans to actual booleans
      if (filterParams.include_inactive) {
        filterParams.include_inactive = filterParams.include_inactive === 'true';
      }
      
      const result = await getAllExpenses(user.userId, filterParams);

      const response = { 
        status: 200, 
        jsonBody: { 
          success: true, 
          data: result,
          count: result.count || result.expenses?.length || 0
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Get Expense by ID
 */
app.http('getExpenseById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses/{expenseId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { expenseId } = request.params;
      const { include_inactive } = request.query;
      
      const result = await getExpenseById(
        expenseId, 
        user.userId,
        include_inactive === 'true'
      );

      const response = { 
        status: 200, 
        jsonBody: { 
          success: true, 
          data: result 
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Update Expense WITH FILE UPLOAD
 */
app.http('updateExpense', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'expenses/update/{expenseId}',
  handler: async (req, context) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(req);

      // Only owners can update their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { expenseId } = req.params;
      const headers = Object.fromEntries(req.headers);
      const busboy = Busboy({ headers });

      let updateData = {};
      let proofFile = null;
      let deleteProof = false;
      let busboyError = null;

      const fileParsePromise = new Promise((resolve, reject) => {
        busboy.on('field', (fieldname, val) => {
          try {
            // Handle different field formats
            if (fieldname === 'data' || fieldname === 'updateData') {
              try {
                updateData = { ...updateData, ...JSON.parse(val) };
              } catch (e) {
                // If parsing fails, use as string
                updateData[fieldname] = val;
              }
            } else if (fieldname === 'delete_proof') {
              deleteProof = val === 'true' || val === true;
            } else if (fieldname === 'amount' && val) {
              updateData[fieldname] = parseFloat(val);
            } else if (fieldname === 'date' && val) {
              updateData[fieldname] = new Date(val);
            } else {
              // Direct fields
              updateData[fieldname] = val;
            }
          } catch (error) {
            context.log(`Error parsing field ${fieldname}:`, error);
          }
        });

        busboy.on('file', (fieldname, file, { filename, encoding, mimeType }) => {
          const chunks = [];
          let fileSize = 0;
          const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

          // Validate file type
          const allowedMimeTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 
            'image/gif', 'image/webp', 'image/heic',
            'application/pdf'
          ];
          
          if (!allowedMimeTypes.includes(mimeType)) {
            file.destroy();
            busboyError = 'Only images (JPEG, PNG, GIF, WebP, HEIC) and PDF files are allowed';
            reject(new Error(busboyError));
            return;
          }

          file.on('data', (chunk) => {
            fileSize += chunk.length;
            if (fileSize > MAX_FILE_SIZE) {
              file.destroy();
              busboyError = 'File size exceeds 10MB limit';
              reject(new Error(busboyError));
              return;
            }
            chunks.push(chunk);
          });
          
          file.on('end', () => {
            if (fieldname === 'proof') {
              proofFile = {
                fieldname,
                originalname: filename,
                mimetype: mimeType,
                buffer: Buffer.concat(chunks),
                size: fileSize
              };
            }
          });

          file.on('error', (err) => {
            busboyError = err.message;
            reject(err);
          });
        });

        busboy.on('finish', () => {
          if (busboyError) {
            reject(new Error(busboyError));
          } else {
            resolve();
          }
        });

        busboy.on('error', (err) => {
          busboyError = err.message;
          reject(err);
        });
      });

      // Feed Busboy with raw buffer
      const buffer = Buffer.from(await req.arrayBuffer());
      busboy.end(buffer);
      
      try {
        await fileParsePromise;
      } catch (parseError) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: parseError.message || 'Error parsing form data' 
          },
        };
      }

      // Validate bunk_id if category is being changed to fuel
      if (updateData.category === 'fuel' && !updateData.bunk_id) {
        return {
          status: 400,
          jsonBody: { 
            success: false, 
            error: 'Bunk ID is required for fuel expenses' 
          },
        };
      }

      // Clear bunk_id if category is not fuel
      if (updateData.category && updateData.category !== 'fuel') {
        updateData.bunk_id = null;
      }

      // Call controller with all parameters
      const result = await updateExpense(
        expenseId, 
        user.userId, 
        updateData, 
        proofFile,
        deleteProof
      );

      const response = { 
        status: 200, 
        jsonBody: { 
          success: true, 
          data: result,
          message: 'Expense updated successfully'
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      context.log('Update expense error:', err.message);
      return {
        status: err.status || 500,
        jsonBody: { 
          success: false, 
          error: err.message,
          details: err.details || null
        },
      };
    }
  },
});

/**
 * ✅ Delete Expense
 */
app.http('deleteExpense', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'expenses/delete/{expenseId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can delete their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { expenseId } = request.params;
      const result = await deleteExpense(expenseId, user.userId);

      const response = { 
        status: 200, 
        jsonBody: { 
          success: true, 
          data: result,
          message: 'Expense deleted successfully'
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Get Expense Statistics
 */
app.http('getExpenseStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses/stats/{period}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view stats
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { period } = request.params;
      const result = await getExpenseStats(user.userId, period);

      const response = { 
        status: 200, 
        jsonBody: { 
          success: true, 
          data: result 
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Get Expenses by Lorry
 */
app.http('getExpensesByLorry', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses/lorry/{lorryId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { lorryId } = request.params;
      const filterParams = request.query;
      
      // Convert string booleans to actual booleans
      if (filterParams.include_inactive) {
        filterParams.include_inactive = filterParams.include_inactive === 'true';
      }
      
      const result = await getExpensesByLorry(user.userId, lorryId, filterParams);

      const response = { 
        status: 200, 
        jsonBody: { 
          success: true, 
          data: result 
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Get Expenses by Bunk
 */
app.http('getExpensesByBunk', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses/bunk/{bunkId}',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const { bunkId } = request.params;
      const filterParams = request.query;
      
      // Convert string booleans to actual booleans
      if (filterParams.include_inactive) {
        filterParams.include_inactive = filterParams.include_inactive === 'true';
      }
      
      const result = await getExpensesByBunk(user.userId, bunkId, filterParams);

      const response = { 
        status: 200, 
        jsonBody: { 
          success: true, 
          data: result 
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

/**
 * ✅ Get Fuel Expenses Summary
 */
app.http('getFuelExpensesSummary', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'expenses/summary/fuel',
  handler: async (request) => {
    try {
      await connectDB();
      
      const { decoded: user, newAccessToken } = await verifyToken(request);

      // Only owners can view their expenses
      if (user.role !== 'owner') {
        return {
          status: 403,
          jsonBody: { success: false, error: 'Access denied. Owner role required.' },
        };
      }

      const filterParams = request.query;
      
      // Parse date strings to Date objects if present
      if (filterParams.start_date) {
        filterParams.start_date = new Date(filterParams.start_date);
      }
      if (filterParams.end_date) {
        filterParams.end_date = new Date(filterParams.end_date);
      }
      
      const result = await getFuelExpensesSummary(user.userId, filterParams);

      const response = { 
        status: 200, 
        jsonBody: { 
          success: true, 
          data: result 
        } 
      };
      
      if (newAccessToken) {
        response.jsonBody.newAccessToken = newAccessToken;
      }
      
      return response;
    } catch (err) {
      return {
        status: err.status || 500,
        jsonBody: { success: false, error: err.message },
      };
    }
  },
});

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getExpensesByLorry,
  getExpensesByBunk,
  getFuelExpensesSummary
};