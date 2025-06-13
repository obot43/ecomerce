import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { hash } from 'bcryptjs';

export async function POST(req) {
  try {
    const { username, email, password, fullName, role = 'user' } = await req.json();

    // Validasi input
    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Username, email, dan password wajib diisi' 
        }), 
        { status: 400 }
      );
    }

    // Validasi role
    const allowedRoles = ['admin', 'user'];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Role tidak valid' 
        }), 
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (password.length < 6) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Password minimal 6 karakter' 
        }), 
        { status: 400 }
      );
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Format email tidak valid' 
        }), 
        { status: 400 }
      );
    }

    const usersRef = collection(db, 'users');

    // Cek apakah username sudah ada
    const usernameQuery = query(usersRef, where('username', '==', username));
    const usernameSnapshot = await getDocs(usernameQuery);

    if (!usernameSnapshot.empty) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Username sudah digunakan' 
        }), 
        { status: 409 }
      );
    }

    // Cek apakah email sudah ada
    const emailQuery = query(usersRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Email sudah digunakan' 
        }), 
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Buat user baru (selalu sebagai user)
    const newUser = {
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      fullName: fullName || '',
      role: 'user', // Set default role to user always
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    // Simpan ke Firestore
    const docRef = await addDoc(usersRef, newUser);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Pendaftaran berhasil sebagai User',
        userId: docRef.id,
        role: newUser.role
      }), 
      { status: 201 }
    );

  } catch (error) {
    console.error('Error saat registrasi:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: 'Terjadi kesalahan server' 
      }), 
      { status: 500 }
    );
  }
}