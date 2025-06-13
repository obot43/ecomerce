// /app/api/auth/login/route.js
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { compare } from 'bcryptjs';

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Find user in Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Username atau password salah' 
        }), 
        { status: 401 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isValid = await compare(password, userData.password);

    if (!isValid) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Username atau password salah' 
        }), 
        { status: 401 }
      );
    }

    // Return user data with role
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userDoc.id,
          username: userData.username,
          fullName: userData.fullName,
          role: userData.role,
          permissions: userData.permissions
        },
        message: 'Login berhasil'
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Terjadi kesalahan server' 
      }), 
      { status: 500 }
    );
  }
}
