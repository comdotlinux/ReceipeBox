import { chromium, FullConfig } from '@playwright/test';
import PocketBase from 'pocketbase';

async function globalSetup(config: FullConfig) {
  console.log('Setting up test users...');
  
  const pb = new PocketBase('http://localhost:8090');
  
  try {
    // Create admin user directly in PocketBase
    try {
      await pb.collection('users').create({
        email: 'admin@test.com',
        password: 'testpassword123',
        passwordConfirm: 'testpassword123',
        name: 'Test Admin',
        role: 'admin'
      });
      console.log('Admin user created');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.data?.email) {
        console.log('Admin user already exists');
      } else {
        console.log('Admin user creation failed:', error.message);
      }
    }

    // Create reader user directly in PocketBase
    try {
      await pb.collection('users').create({
        email: 'reader@test.com',
        password: 'testpassword123',
        passwordConfirm: 'testpassword123',
        name: 'Test Reader',
        role: 'reader'
      });
      console.log('Reader user created');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.data?.email) {
        console.log('Reader user already exists');
      } else {
        console.log('Reader user creation failed:', error.message);
      }
    }
    
    console.log('Test users setup completed');
  } catch (error) {
    console.log('Error setting up test users:', error.message);
  }
}

export default globalSetup;