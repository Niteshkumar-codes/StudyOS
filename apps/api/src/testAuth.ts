import mongoose from 'mongoose';
import http from 'http';
import app from './app';
import { User } from './models/User';
import { Otp } from './models/Otp';
import { RefreshToken } from './models/RefreshToken';
import { verifyTransporter } from './services/mailService';

const PORT = 5555;
const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/studyos_test';

async function runTests() {
  let server: http.Server | null = null;

  try {
     
    console.log('🧪 Starting Authentication Integration Tests...');

    // 1. Force connect to test database
    await mongoose.disconnect();
    await mongoose.connect(TEST_MONGO_URI);
     
    console.log('✔ Connected to test database:', TEST_MONGO_URI);

    // Clean test database collections
    await User.deleteMany({});
    await Otp.deleteMany({});
    await RefreshToken.deleteMany({});
     
    console.log('✔ Cleaned test collections.');

    // 2. Start server
    await verifyTransporter();
    server = app.listen(PORT);
     
    console.log(`✔ Test server listening on http://localhost:${PORT}`);

    const baseUrl = `http://localhost:${PORT}/api`;

    // Test Data
    const testUser = {
      name: 'Test Engineer',
      username: 'test_eng',
      email: 'engineer@studyos.com',
      password: 'Password@123',
      confirmPassword: 'Password@123',
      preparationTypes: ['USMLE'],
      termsAcceptance: true,
    };

    // 3. Test Username Availability (expect available)
    const checkRes = await fetch(`${baseUrl}/auth/check-username?username=${testUser.username}`);
    const checkData = (await checkRes.json()) as any;
    if (!checkData.available) throw new Error('Username availability check failed');
     
    console.log('✔ Username availability check passed.');

    // 4. Test Registration
     
    console.log('⚡ Registering test user...');
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const registerData = (await registerRes.json()) as any;
    if (registerRes.status !== 201) {
      throw new Error(`Register failed: ${JSON.stringify(registerData)}`);
    }
     
    console.log('✔ User registration initiated successfully.');

    // 5. Query OTP directly from Database
    const savedOtp = await Otp.findOne({ email: testUser.email });
    if (!savedOtp) throw new Error('OTP was not saved to database');
    const otpCode = savedOtp.code;
     
    console.log(`✔ Found OTP code in DB: ${otpCode}`);

    // 6. Test OTP Verification
     
    console.log('⚡ Verifying OTP...');
    const verifyRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, code: otpCode }),
    });
    const verifyData = (await verifyRes.json()) as any;
    if (verifyRes.status !== 200) {
      throw new Error(`OTP Verification failed: ${JSON.stringify(verifyData)}`);
    }

    const { accessToken } = verifyData;
    if (!accessToken) throw new Error('Verify OTP did not return access token');

    // Parse cookie header
    const setCookieHeaders = verifyRes.headers.get('set-cookie');
    if (!setCookieHeaders) throw new Error('Verify OTP did not set refresh token cookie');
    const refreshTokenCookie = setCookieHeaders.split(';')[0];
     
    console.log('✔ OTP verified successfully. Acquired session cookies.');

    // 7. Test Protected Profile Retrieval
     
    console.log('⚡ Querying profile with JWT access token...');
    const profileRes = await fetch(`${baseUrl}/profile`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profileData = (await profileRes.json()) as any;
    if (profileRes.status !== 200) {
      throw new Error(`Profile retrieval failed: ${JSON.stringify(profileData)}`);
    }
    if (profileData.user.username !== testUser.username) {
      throw new Error('Retrieved profile does not match registration info');
    }
     
    console.log('✔ Protected profile retrieved successfully.');

    // 8. Test Profile Editing
     
    console.log('⚡ Updating profile (modifying full name and exam list)...');
    const updateRes = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name: 'Test Engineer Senior',
        preparationTypes: ['USMLE', 'MCAT'],
      }),
    });
    const updateData = (await updateRes.json()) as any;
    if (updateRes.status !== 200) {
      throw new Error(`Profile update failed: ${JSON.stringify(updateData)}`);
    }
    if (
      updateData.user.name !== 'Test Engineer Senior' ||
      updateData.user.preparationTypes.length !== 2
    ) {
      throw new Error('Updated profile fields do not match request details');
    }
     
    console.log('✔ User profile updated successfully.');

    // 9. Test JWT Refresh Token Rotation
     
    console.log('⚡ Testing silent refresh and token rotation...');
    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: refreshTokenCookie },
    });
    const refreshData = (await refreshRes.json()) as any;
    if (refreshRes.status !== 200) {
      throw new Error(`Session refresh failed: ${JSON.stringify(refreshData)}`);
    }

    const newAccessToken = refreshData.accessToken;
    const newSetCookieHeaders = refreshRes.headers.get('set-cookie');
    if (!newAccessToken || !newSetCookieHeaders) {
      throw new Error('Refresh did not return rotated token pair');
    }
    const rotatedCookie = newSetCookieHeaders.split(';')[0];
     
    console.log('✔ Refresh token rotated successfully.');

    // 10. Test Token Reuse Detection
     
    console.log('⚡ Attempting to reuse old refresh token (expecting failure and revocation)...');
    const reuseRes = await fetch(`${baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: refreshTokenCookie },
    });
    if (reuseRes.status !== 401) {
      throw new Error('Token reuse detection failed to block request');
    }
    // Verify user sessions are indeed revoked
    const activeTokensCount = await RefreshToken.countDocuments({ userId: verifyData.user.id });
    if (activeTokensCount !== 0) {
      throw new Error('Reuse detection failed to revoke all active sessions for the user');
    }
     
    console.log('✔ Refresh token reuse detection blocked and revoked user sessions successfully.');

    // 11. Clean login with new credentials (standard credentials check)
     
    console.log('⚡ Logging in with standard credentials...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginId: testUser.username, password: testUser.password }),
    });
    const loginData = (await loginRes.json()) as any;
    if (loginRes.status !== 200) {
      throw new Error(`Standard credentials login failed: ${JSON.stringify(loginData)}`);
    }
    const freshCookie = loginRes.headers.get('set-cookie')?.split(';')[0] || '';
     
    console.log('✔ Credentials login successful.');

    // 12. Test Logout
     
    console.log('⚡ Requesting logout...');
    const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: freshCookie },
    });
    if (logoutRes.status !== 200) {
      throw new Error('Logout failed');
    }
     
    console.log('✔ Session logged out successfully.');

     
    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n');
  } catch (error) {
     
    console.error('\n❌ INTEGRATION TEST FAILED:', error);
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
