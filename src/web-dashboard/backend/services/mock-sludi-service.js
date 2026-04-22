// mock-sludi-service.js
const User = require('../models/User');

class MockSLUDIService {
  constructor() {
    // Users are now stored in MongoDB database
    // Use seed-users.js script to populate initial users
  }

  // Mock authentication endpoint
  async authenticate(authRequest) {
    const { individualId, request } = authRequest;
    
    try {
      // Hardcoded admin credentials fallback
      if (individualId === 'admin' && request.otp === 'admin') {
        const adminUser = {
          individualId: 'admin',
          name: 'System Administrator',
          email: 'admin@resq.com',
          phone: '+911234567890',
          role: 'admin',
          active: true,
          location: { lat: 28.6139, lng: 77.2090 }
        };
        
        return {
          id: authRequest.id,
          version: authRequest.version,
          transactionID: authRequest.transactionID,
          responseTime: new Date().toISOString(),
          response: {
            authStatus: true,
            authToken: this.generateMockToken(adminUser)
          },
          errors: null
        };
      }
      
      // Fetch user from database
      const user = await User.findOne({ individualId, active: true });
      
      if (!user) {
        return {
          id: authRequest.id,
          version: authRequest.version,
          transactionID: authRequest.transactionID,
          responseTime: new Date().toISOString(),
          response: {
            authStatus: false
          },
          errors: [{
            errorCode: "IDA-AUTH-001",
            message: "User not found"
          }]
        };
      }
      
      // Verify password using bcrypt
      const isPasswordValid = await user.comparePassword(request.otp);
      
      if (isPasswordValid) {
        return {
          id: authRequest.id,
          version: authRequest.version,
          transactionID: authRequest.transactionID,
          responseTime: new Date().toISOString(),
          response: {
            authStatus: true,
            authToken: this.generateMockToken(user)
          },
          errors: null
        };
      }
      
      return {
        id: authRequest.id,
        version: authRequest.version,
        transactionID: authRequest.transactionID,
        responseTime: new Date().toISOString(),
        response: {
          authStatus: false
        },
        errors: [{
          errorCode: "IDA-AUTH-002",
          message: "Invalid password"
        }]
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        id: authRequest.id,
        version: authRequest.version,
        transactionID: authRequest.transactionID,
        responseTime: new Date().toISOString(),
        response: {
          authStatus: false
        },
        errors: [{
          errorCode: "IDA-AUTH-500",
          message: "Internal server error"
        }]
      };
    }
  }

  // Mock eKYC endpoint
  async performKYC(kycRequest) {
    const { individualId, allowedKycAttributes } = kycRequest;
    
    // Hardcoded admin fallback for KYC
    if (individualId === 'admin') {
      const adminUser = {
        individualId: 'admin',
        name: 'System Administrator',
        email: 'admin@resq.com',
        phone: '+911234567890',
        role: 'admin',
        active: true,
        location: { lat: 28.6139, lng: 77.2090 }
      };
      
      const kycData = {};
      if (allowedKycAttributes.includes('name')) kycData.name = adminUser.name;
      if (allowedKycAttributes.includes('email')) kycData.email = adminUser.email;
      if (allowedKycAttributes.includes('phone')) kycData.phone = adminUser.phone;
      if (allowedKycAttributes.includes('role')) kycData.role = adminUser.role;
      
      return {
        id: kycRequest.id,
        version: kycRequest.version,
        transactionID: kycRequest.transactionID,
        responseTime: new Date().toISOString(),
        response: {
          kycStatus: true,
          authToken: this.generateMockToken(adminUser),
          identity: kycData
        },
        errors: null
      };
    }
    
    const user = await User.findOne({ individualId, active: true });
    
    if (user) {
      const kycData = {};
      
      // Return only requested attributes
      if (allowedKycAttributes.includes('name')) kycData.name = user.name;
      if (allowedKycAttributes.includes('email')) kycData.email = user.email;
      if (allowedKycAttributes.includes('phone')) kycData.phone = user.phone;
      if (allowedKycAttributes.includes('role')) kycData.role = user.role;
      
      return {
        id: kycRequest.id,
        version: kycRequest.version,
        transactionID: kycRequest.transactionID,
        responseTime: new Date().toISOString(),
        response: {
          kycStatus: true,
          authToken: this.generateMockToken(user),
          identity: kycData
        },
        errors: null
      };
    }
    
    return {
      id: kycRequest.id,
      version: kycRequest.version,
      transactionID: kycRequest.transactionID, 
      responseTime: new Date().toISOString(),
      response: {
        kycStatus: false
      },
      errors: [{
        errorCode: "IDA-KYC-001", 
        message: "KYC failed"
      }]
    };
  }

  generateMockToken(user) {
    return `mock_token_${user.individualId}_${Date.now()}`;
  }
}

module.exports = MockSLUDIService;
