import { db } from '@/app/lib/firebase';
import { collection, getDocs, addDoc, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

// GET: Fetch all products
export async function GET() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST: Add new product
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.nama || !body.harga) {
      return NextResponse.json(
        { error: 'Nama dan harga wajib diisi' },
        { status: 400 }
      );
    }

    // Prepare product data
    const productData = {
      nama: body.nama,
      harga: Number(body.harga),
      gambar: body.gambar || '', // Image URL or base64
      kategori: body.kategori || '',
      deskripsi: body.deskripsi || '',
      createdAt: new Date().toISOString()
    };

    // Check if product name already exists
    const nameQuery = query(
      collection(db, 'products'), 
      where('nama', '==', productData.nama)
    );
    const nameSnapshot = await getDocs(nameQuery);

    if (!nameSnapshot.empty) {
      return NextResponse.json(
        { error: 'Menu dengan nama tersebut sudah ada' },
        { status: 400 }
      );
    }

    // Add new product
    const docRef = await addDoc(collection(db, 'products'), productData);

    return NextResponse.json({
      id: docRef.id,
      ...productData
    });

  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: 'Failed to add product' },
      { status: 500 }
    );
  }
}

// PUT: Update product
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Convert price to number if present
    if (updateData.harga) {
      updateData.harga = Number(updateData.harga);
    }

    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: 'Menu updated successfully',
      id,
      ...updateData
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE: Remove product
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);

    return NextResponse.json({ 
      message: 'Menu deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}